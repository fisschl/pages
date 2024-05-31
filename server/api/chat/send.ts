import { last, pick } from "lodash-es";
import OpenAI from "openai";
import { z } from "zod";
import { publisher } from "~/server/database/mqtt";
import { database } from "~/server/database/postgres";
import { use401, useUserSecret } from "~/server/utils/user";
import { uuid } from "~/server/utils/uuid";
import { parseMarkdown } from "../markdown";

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
  const input = await database.ai_chat.create({
    data: {
      id: uuid(),
      role: "user",
      content: content,
      user_id,
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
    status: "stable",
  };
  const secret = await useUserSecret(user_id);
  publisher.publish(secret, JSON.stringify(input_message));
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
      deleted: false,
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
    for await (const { choices } of stream) {
      if (!choices.length) continue;
      const [{ delta }] = choices;
      if (!delta || !delta.content) continue;
      output.content += delta.content;
      const message = {
        ...output,
        content: await parseMarkdown(output.content),
        user_id: undefined,
        status: "loading",
      };
      publisher.publish(secret, JSON.stringify(message));
    }
  } catch (err) {
    await database.log.create({
      data: {
        id: uuid(),
        tag: "OpenAI 响应",
        content: JSON.stringify({
          error: String(err),
          input: input,
          output: output,
          message: last(history_messages),
        }),
      },
    });
    output.content = String(err);
  }
  const result = await database.ai_chat.update({
    where: { id: output.id },
    data: { content: output.content },
  });
  const message = {
    ...result,
    content: await parseMarkdown(result.content),
    user_id: undefined,
    status: "stable",
  };
  publisher.publish(secret, JSON.stringify(message));
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  return { message: "完成" };
});
