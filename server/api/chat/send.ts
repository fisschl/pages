import { last, pick, throttle } from "lodash-es";
import OpenAI from "openai";
import { database } from "~/server/database/postgres";
import { parseMarkdown } from "../markdown";
import { z } from "zod";
import { uuid } from "~/server/utils/uuid";
import { publisher } from "~/server/database/mqtt";
import { useUser } from "~/server/utils/user";
export const OPENAI_MODEL = "gpt-4o";

export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const request_schema = z.object({
  chat_id: z.string().optional(),
  content: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  const body = await readValidatedBody(event, request_schema.parse);
  if (body.chat_id) {
    const item = await database.ai_chat.findFirst({
      where: { id: body.chat_id, user_id: user.id },
      include: { images: true },
    });
    if (!item) throw createError({ status: 404 });
    body.content = item.content;
    body.images = item.images.map((item) => item.image);
  }
  const { content, images } = body;
  if (!content) throw createError({ status: 400 });
  const input = await database.ai_chat.create({
    data: {
      id: uuid(),
      role: "user",
      content: content,
      user_id: user.id,
      images: {
        create: images?.map((item) => ({
          id: uuid(),
          image: item,
        })),
      },
    },
    include: { images: true },
  });
  const input_message = {
    ...input,
    content: await parseMarkdown(input.content),
    user_id: undefined,
  };
  publisher.publish(user.id, JSON.stringify(input_message));
  const output = await database.ai_chat.create({
    data: {
      id: uuid(),
      role: "assistant",
      content: "",
      user_id: input.user_id,
    },
  });
  /**
   * 历史消息
   */
  const history = await database.ai_chat.findMany({
    where: {
      user_id: input.user_id,
      create_at: { lt: input.create_at },
    },
    orderBy: { create_at: "desc" },
    take: 9,
    include: { images: true },
  });
  /**
   * 处理后的发送参数
   */
  const history_messages = [...history.reverse(), input].map((item) => {
    if (!item.images?.length || item.role !== "user") {
      return pick(item, ["role", "content"]);
    }
    // 处理带有图片的消息
    const content = item.images.map((file) => {
      const part: OpenAI.ChatCompletionContentPartImage = {
        type: "image_url",
        image_url: { url: file.image },
      };
      return part;
    });
    const param: OpenAI.ChatCompletionMessageParam = {
      role: item.role,
      content: [{ type: "text", text: item.content }, ...content],
    };
    return param;
  });
  try {
    /**
     * 发送消息给 OpenAI
     */
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: history_messages,
      stream: true,
      max_tokens: 2048,
    });
    /**
     * 实时发送响应给客户端
     */
    const publish_throttle = throttle(async () => {
      const message = {
        ...output,
        content: await parseMarkdown(output.content),
        user_id: undefined,
      };
      publisher.publish(user.id, JSON.stringify(message));
    }, 100);
    for await (const { choices } of stream) {
      if (!choices.length) continue;
      const [{ delta }] = choices;
      if (!delta.content) continue;
      output.content += delta.content;
      publish_throttle();
    }
  } catch (err) {
    output.content = String(err);
    await database.log.create({
      data: {
        id: uuid(),
        tag: "OpenAI 异常",
        content: JSON.stringify({
          error: String(err),
          input: input,
          output: output,
          message: last(history_messages),
        }),
      },
    });
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  const result = await database.ai_chat.update({
    where: { id: output.id },
    data: { content: output.content },
  });
  const message = {
    ...result,
    content: await parseMarkdown(result.content),
    user_id: undefined,
  };
  publisher.publish(user.id, JSON.stringify(message));
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  return { message: "完成" };
});
