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
import { $id, ai_chats, chat_files } from "~/server/database/schema";
import { useCurrentUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { publisher } from "../sse";

export const AiChartInsertSchema = createInsertSchema(ai_chats);

export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const SendBodySchema = z.object({
  content: z.string(),
  images: z.array(z.string()).optional(),
});

export type ChatFile = typeof chat_files.$inferSelect;

export default defineEventHandler(async (event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  const { content, images } = await readValidatedBody(
    event,
    SendBodySchema.parse,
  );
  const history = await database.query.ai_chats.findMany({
    where: eq(ai_chats.user_id, user.id),
    orderBy: asc(ai_chats.update_at),
    limit: 9,
    with: { files: true },
  });
  const [chat_user] = await database
    .insert(ai_chats)
    .values({
      role: "user",
      content: content,
      user_id: user.id,
    })
    .returning();
  // 若携带文件
  const files: ChatFile[] = [];
  if (images?.length) {
    const items = images.map<ChatFile>((item) => {
      return {
        chat_id: chat_user.id,
        key: item,
        update_at: new Date().toISOString(),
      };
    });
    files.push(...items);
  }
  for (const file of files) {
    await database.insert(chat_files).values(file).onConflictDoUpdate({
      target: chat_files.key,
      set: file,
    });
  }
  const current_message = {
    ...chat_user,
    files: files,
  };
  await publisher.publish(
    user.id,
    JSON.stringify({
      ...current_message,
      content: parseMarkdown(current_message.content),
      user_id: undefined,
    }),
  );
  const history_messages = [...history, current_message].map((item) => {
    if (!item.files.length || item.role !== "user") {
      const message: ChatCompletionMessageParam = pick(item, [
        "role",
        "content",
      ]);
      return message;
    }
    // 处理带有图片的消息
    const content: ChatCompletionContentPart[] = item.files.map((file) => {
      const content: ChatCompletionContentPart = {
        type: "image_url",
        image_url: {
          url: `https://cdn.fisschl.world/${file.key}`,
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
  // 发送消息给 OpenAI
  const stream = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: history_messages,
    stream: true,
    max_tokens: 2048,
  });
  const resulting: output<typeof AiChartInsertSchema> = {
    id: $id(),
    user_id: user.id,
    role: "assistant",
    content: "",
  };
  const publish = throttle(async () => {
    const message = {
      ...resulting,
      content: parseMarkdown(resulting.content),
      user_id: undefined,
    };
    await publisher.publish(user.id, JSON.stringify(message));
  }, 200);
  for await (const { choices } of stream) {
    if (!choices.length) continue;
    const [{ delta }] = choices;
    if (!delta.content) continue;
    resulting.content += delta.content;
    await publish();
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
  const [theEnd] = await database
    .insert(ai_chats)
    .values([resulting])
    .returning();
  await publisher.publish(
    user.id,
    JSON.stringify({
      ...theEnd,
      content: parseMarkdown(theEnd.content),
      user_id: undefined,
    }),
  );
  return { message: "完成" };
});
