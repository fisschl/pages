import { groupBy, last, pick } from "lodash-es";
import OpenAI from "openai";
import { z } from "zod";
import { publisher } from "~/server/database/mqtt";
import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";
import { uuid } from "~/server/utils/uuid";
import { parseMarkdown } from "../markdown";
import { writeLog } from "~/server/database/clickhouse";
import type {
  message_ai_chat as ChatMessage,
  message_ai_image as ChatImage,
} from "@prisma/client";

type Message = ChatMessage & {
  images?: ChatImage[];
};

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
  const input: Message = await database.message_ai_chat.create({
    data: {
      message_id: uuid(),
      role: "user",
      content: content,
      user_id,
    },
  });
  input.images = images?.map((item) => ({
    image_id: uuid(),
    image: item,
    message_id: input.message_id,
  }));
  if (input.images?.length) {
    await database.message_ai_image.createMany({
      data: input.images,
    });
  }
  const input_message = {
    ...input,
    content: await parseMarkdown(input.content),
    user_id: undefined,
    status: "stable",
  };
  const publish_topic = `${user_id}/ai_chat`;
  publisher.publish(publish_topic, JSON.stringify(input_message));
  const output = await database.message_ai_chat.create({
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
  const history = await database.message_ai_chat.findMany({
    where: {
      user_id: input.user_id,
      time: { lt: input.time },
    },
    orderBy: { time: "desc" },
    take: 9,
  });
  const history_images = await database.message_ai_image.findMany({
    where: {
      message_id: { in: history.map((item) => item.message_id) },
    },
  });
  const history_images_group = groupBy(history_images, "message_id");
  /**
   * 处理后的发送参数
   */
  const history_messages = [...history.reverse(), input].map((item) => {
    const images = history_images_group[item.message_id];
    if (!images?.length || item.role !== "user") {
      return pick(item, ["role", "content"]);
    }
    // 处理带有图片的消息
    const content = images.map((file) => {
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
      publisher.publish(publish_topic, JSON.stringify(message));
    }
  } catch (err) {
    const content = JSON.stringify({
      error: err,
      input,
      output,
      message: last(history_messages),
    });
    await writeLog("OpenAI 异常", content);
    output.content = "未知异常：" + err;
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  const result = await database.message_ai_chat.update({
    where: { user_id_time: { user_id: output.user_id, time: output.time } },
    data: { content: output.content },
  });
  const message = {
    ...result,
    content: await parseMarkdown(result.content),
    status: "stable",
  };
  publisher.publish(publish_topic, JSON.stringify(message));
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  return { message: "完成" };
});
