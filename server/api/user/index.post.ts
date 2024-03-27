import { hashPassword } from "~/server/utils/password";
import { UserInsertSchema, users } from "~/server/database/schema";
import { database } from "~/server/database/postgres";
import { sanitize } from "~/server/utils/purify";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, UserInsertSchema.parse);
  body.name = sanitize(body.name);
  body.role = undefined;
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await database.insert(users).values(body);
  return { message: "注册成功" };
});
