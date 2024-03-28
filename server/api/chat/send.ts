import { z } from "zod";
import { useCurrentUser } from "../auth/index.post";
import OpenAI from "openai";
import { publisher } from "~/server/database/redis";
import { $id, ai_chats } from "~/server/database/schema";
import { database } from "~/server/database/postgres";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  baseURL: process.env["OPENAI_PROXY_URL"],
});

const SendBodySchema = z.object({
  content: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  const { content } = await readValidatedBody(event, SendBodySchema.parse);
  const message = {
    role: "user",
    content: content,
  };
  const [item] = await database
    .insert(ai_chats)
    .values({
      ...message,
      user_id: user.id,
    })
    .returning();
  await publisher.publish(
    user.id,
    JSON.stringify({
      method: "用户消息",
      ...message,
      id: item.id,
    }),
  );
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: content }],
    stream: true,
  });
  for await (const { choices } of stream) {
    if (!choices.length) continue;
    const { delta } = choices[0];
    console.log(delta.content);
  }
});
