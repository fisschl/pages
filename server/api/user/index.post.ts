import { object, parse, string, undefined_ } from "valibot";
import { database } from "~/server/database/postgres";
import { hashPassword } from "~/server/utils/password";
import { sanitize } from "~/server/utils/purify";
import { uuid } from "../../utils/uuid";

const BodySchema = object({
  name: string(),
  password: string(),
  role: undefined_(),
});

/**
 * 注册用户
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (value) =>
    parse(BodySchema, value),
  );
  body.name = sanitize(body.name);
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await database.user.create({
    data: { ...body, id: uuid() },
  });
  return { message: "注册成功" };
});
