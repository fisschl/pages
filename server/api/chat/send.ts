import { desc, eq } from "drizzle-orm";
import { pick, throttle } from "lodash-es";
import OpenAI from "openai";
import type { output } from "zod";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { publisher } from "~/server/database/redis";
import type { AiChartInsertSchema } from "~/server/database/schema";
import { $id, ai_chats } from "~/server/database/schema";
import { useCurrentUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { upsert_residual } from "./billing";

export const openai = new OpenAI({
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
  const [item] = await database
    .insert(ai_chats)
    .values({
      role: "user",
      content: content,
      user_id: user.id,
    })
    .returning();
  await publisher.publish(user.id, JSON.stringify(item));
  const history = await database.query.ai_chats.findMany({
    where: eq(ai_chats.user_id, user.id),
    orderBy: desc(ai_chats.update_at),
    limit: 9,
  });
  const messages = history.reverse().map((item) => {
    return pick(item, ["role", "content"]);
  });
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: messages,
    stream: true,
  });
  const resulting: output<typeof AiChartInsertSchema> = {
    id: $id(),
    user_id: user.id,
    role: "assistant",
    content: "",
  };
  const publish = throttle(async () => {
    const content = parseMarkdown(resulting.content);
    const item = {
      ...resulting,
      content,
    };
    await publisher.publish(user.id, JSON.stringify(item));
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
  theEnd.content = parseMarkdown(theEnd.content);
  await publisher.publish(user.id, JSON.stringify(theEnd));
  upsert_residual();
  return { message: "完成" };
});
