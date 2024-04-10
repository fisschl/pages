import type { ai_chat, chat_file } from "@prisma/client";
import { pick, throttle } from "lodash-es";
import OpenAI from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/index";
import { array, object, optional, parse, string } from "valibot";
import { database } from "~/server/database/postgres";
import { useUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { oss } from "../oss/download";
import { publisher } from "../socket";

export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const SendBodySchema = object({
  chat_id: optional(string()),
  content: optional(string()),
  images: optional(array(string())),
});

export default defineEventHandler(async (event) => {
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  const body = await readValidatedBody(event, (value) =>
    parse(SendBodySchema, value),
  );
  if (body.chat_id) {
    const item = await database.ai_chat.findFirst({
      where: { id: body.chat_id, user_id: user.id },
      include: { chat_file: true },
    });
    if (!item) throw createError({ status: 404 });
    body.content = item.content;
    body.images = item.chat_file.map((item) => item.key);
  }
  const { content, images } = body;
  if (!content) throw createError({ status: 400 });
  const input_chat = await database.ai_chat.create({
    data: {
      id: uuid(),
      role: "user",
      content: content,
      user_id: user.id,
    },
  });
  const files: chat_file[] = [];
  if (images?.length) {
    const items = images.map((item) => {
      const res: chat_file = {
        id: uuid(),
        chat_id: input_chat.id,
        key: item,
      };
      return res;
    });
    files.push(...items);
  }
  if (files.length) {
    await database.chat_file.createMany({
      data: files,
    });
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
  const result = await database.ai_chat.create({
    data: {
      id: uuid(),
      role: "assistant",
      content: "",
      user_id: input_chat.user_id,
    },
  });
  await send_message_openai(current_message, result);
  return { message: "完成" };
});

export type Chat = ai_chat & {
  chat_file?: chat_file[];
};

const chat_to_history = (item: Chat) => {
  if (!item.chat_file?.length || item.role !== "user") {
    const message: ChatCompletionMessageParam = pick(item, ["role", "content"]);
    return message;
  }
  // 处理带有图片的消息
  const content: ChatCompletionContentPart[] = item.chat_file.map((file) => {
    const uri = oss.signatureUrl(file.key!);
    const content: ChatCompletionContentPart = {
      type: "image_url",
      image_url: { url: uri },
    };
    return content;
  });
  const message: ChatCompletionMessageParam = {
    role: item.role,
    content: [{ type: "text", text: item.content }, ...content],
  };
  return message;
};

const send_to_client = async (item: Chat) => {
  const message = {
    ...item,
    content: await parseMarkdown(item.content),
    user_id: undefined,
  };
  await publisher.publish(item.user_id!, JSON.stringify(message));
};

export const send_message_openai = async (input: Chat, output: Chat) => {
  /**
   * 历史消息
   */
  const history = await database.ai_chat.findMany({
    where: { user_id: input.user_id },
    orderBy: { update_at: "desc" },
    take: 9,
    include: { chat_file: true },
  });
  /**
   * 处理后的发送参数
   */
  const history_messages = [...history.reverse(), input].map((item) => {
    return chat_to_history(item);
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
      await send_to_client(output);
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
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  const result = await database.ai_chat.update({
    where: { id: output.id },
    data: { content: output.content },
  });
  await send_to_client(result);
};
