import { hashPassword } from "~/server/utils/password";
import { UserInsertSchema } from "~/server/utils/schema";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, UserInsertSchema.parse);
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await db.insert(users).values(body);
  return { message: "注册成功" };
});
