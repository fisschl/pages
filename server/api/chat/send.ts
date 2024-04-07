import { asc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { pick, throttle } from "lodash-es";
import OpenAI from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/index";
import type { output } from "zod";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { ai_chats, chat_files } from "~/server/database/schema";
import { useCurrentUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { publisher } from "../sse";
import { oss } from "../oss/download";

export const AiChartInsertSchema = createInsertSchema(ai_chats);

export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const SendBodySchema = z.object({
  content: z.string(),
  images: z.array(z.string()).optional(),
});

export type ChatFile = typeof chat_files.$inferInsert;

export default defineEventHandler(async (event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  const { content, images } = await readValidatedBody(
    event,
    SendBodySchema.parse,
  );
  const [input_chat] = await database
    .insert(ai_chats)
    .values({
      role: "user",
      content: content,
      user_id: user.id,
    })
    .returning();
  const files: ChatFile[] = [];
  if (images?.length) {
    const items = images.map<ChatFile>((item) => {
      return {
        chat_id: input_chat.id,
        key: item,
      };
    });
    files.push(...items);
  }
  if (files.length) {
    await database.insert(chat_files).values(files);
  }
  const current_message = {
    ...input_chat,
    files: files,
  };
  await publisher.publish(
    user.id,
    JSON.stringify({
      ...current_message,
      content: await parseMarkdown(current_message.content),
      user_id: undefined,
    }),
  );
  const [result] = await database
    .insert(ai_chats)
    .values({
      role: "assistant",
      content: "",
      user_id: input_chat.user_id,
    })
    .returning();
  await send_message_openai(current_message, result);
  return { message: "完成" };
});

export type Chat = output<typeof AiChartInsertSchema> & {
  files?: ChatFile[];
};

export const send_message_openai = async (input: Chat, output: Chat) => {
  /**
   * 历史消息
   */
  const history = await database.query.ai_chats.findMany({
    where: eq(ai_chats.user_id, input.user_id),
    orderBy: asc(ai_chats.update_at),
    limit: 9,
    with: { files: true },
  });
  /**
   * 处理后的发送参数
   */
  const history_messages = [...history, input].map((item) => {
    if (!item.files?.length || item.role !== "user") {
      const message: ChatCompletionMessageParam = pick(item, [
        "role",
        "content",
      ]);
      return message;
    }
    // 处理带有图片的消息
    const content: ChatCompletionContentPart[] = item.files.map((file) => {
      const uri = oss.signatureUrl(file.key!);
      const content: ChatCompletionContentPart = {
        type: "image_url",
        image_url: {
          url: uri,
        },
      };
      return content;
    });
    const message: ChatCompletionMessageParam = {
      role: item.role,
      content: [{ type: "text", text: item.content }, ...content],
    };
    return message;
  });
  try {
    /**
     * 发送消息给 OpenAI
     */
    const stream = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: history_messages,
      stream: true,
      max_tokens: 2048,
    });
    /**
     * 实时发送响应给客户端
     */
    const publish = throttle(async () => {
      const message = {
        ...output,
        content: await parseMarkdown(output.content),
        user_id: undefined,
      };
      await publisher.publish(input.user_id, JSON.stringify(message));
    }, 200);
    for await (const { choices } of stream) {
      if (!choices.length) continue;
      const [{ delta }] = choices;
      if (!delta.content) continue;
      output.content += delta.content;
      await publish();
    }
  } catch (e) {
    output.content = String(e);
    console.error("OpenAI 异常", e, input, output);
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
  const [theEnd] = await database
    .update(ai_chats)
    .set({
      content: output.content,
    })
    .where(eq(ai_chats.id, output.id!))
    .returning();
  await publisher.publish(
    input.user_id,
    JSON.stringify({
      ...theEnd,
      content: await parseMarkdown(theEnd.content),
      user_id: undefined,
    }),
  );
};
