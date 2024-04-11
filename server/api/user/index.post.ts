import { database } from "~/server/database/postgres";
import { hashPassword } from "~/server/utils/password";
import { sanitize } from "~/server/utils/purify";
import { uuid } from "../../utils/uuid";
import { z } from "zod";

const request_schema = z.object({
  name: z.string(),
  password: z.string(),
  role: z.undefined(),
});

/**
 * 注册用户
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  body.name = sanitize(body.name);
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await database.user.create({
    data: { ...body, id: uuid() },
  });
  return { message: "注册成功" };
});
