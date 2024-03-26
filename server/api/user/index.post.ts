import { hashPassword } from "~/server/utils/password";
import { UserInsertSchema, users } from "~/server/database/schema";
import { database } from "~/server/database/postgres";
import { sanitize } from "~/server/utils/purify";
import { logs } from "~/server/database/mongo";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, UserInsertSchema.parse);
  body.name = sanitize(body.name);
  body.role = undefined;
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await logs.insertOne({
    metadata: "用户注册",
    timestamp: new Date(),
    user: body,
  });
  await database.insert(users).values(body);
  return { message: "注册成功" };
});
