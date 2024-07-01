import { consola } from "consola";
import { last, pick } from "lodash-es";
import OpenAI from "openai";
import { z } from "zod";
import { publish } from "~/server/database/mqtt";
import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";
import { parseMarkdown, parseMarkdownCache } from "../../utils/markdown";
import { v7 as uuid } from "uuid";

export const OPENAI_MODEL = "gpt-4o";

export const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const request_schema = z.object({
  content: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const user_id = await use401(event);
  const body = await readValidatedBody(event, request_schema.parse);
  const { content, images } = body;
  if (!content) throw createError({ status: 400 });
  const input = await database.chat_message.create({
    data: {
      message_id: uuid(),
      role: "user",
      content: content,
      user_id,
      images: {
        createMany: {
          data: images?.map((item) => ({ image_id: uuid(), url: item })) || [],
        },
      },
    },
    include: { images: true },
  });
  const input_message = {
    ...input,
    content: await parseMarkdownCache(input.content),
    status: "stable",
  };
  const publish_topic = `${user_id}/ai_chat`;
  publish(publish_topic, input_message);
  const output = await database.chat_message.create({
    data: {
      message_id: uuid(),
      role: "assistant",
      content: "",
      user_id: input.user_id,
    },
  });
  /**
   * 历史消息
   */
  const history = await database.chat_message.findMany({
    where: {
      user_id: input.user_id,
      create_time: { lt: input.create_time },
    },
    orderBy: { create_time: "desc" },
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
        image_url: { url: file.url },
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
    for await (const { choices } of stream) {
      if (!choices.length) continue;
      const [{ delta }] = choices;
      if (!delta || !delta.content) continue;
      output.content += delta.content;
      const message = {
        ...output,
        content: await parseMarkdown(output.content),
        status: "loading",
      };
      publish(publish_topic, message);
    }
  } catch (e) {
    consola.error(e);
    const info = JSON.stringify({
      content,
      input,
      output,
      message: last(history_messages),
      error: e,
    });
    consola.error("OpenAI 异常", info);
    output.content = "未知异常：" + e;
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  const result = await database.chat_message.update({
    where: { message_id: output.message_id },
    data: { content: output.content },
  });
  const message = {
    ...result,
    content: await parseMarkdownCache(result.content),
    status: "stable",
  };
  publish(publish_topic, message);
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  return { message: "完成" };
});
