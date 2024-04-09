import { hashPassword } from "~/server/utils/password";
import { database } from "~/server/database/postgres";
import { sanitize } from "~/server/utils/purify";
import { z } from "zod";
import { uuid } from "../../utils/uuid";

const BodySchema = z.object({
  name: z.string(),
  password: z.string(),
  role: z.undefined(),
});

/**
 * 注册用户
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, BodySchema.parse);
  body.name = sanitize(body.name);
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await database.user.create({
    data: {
      ...body,
      id: uuid(),
    },
  });
  return { message: "注册成功" };
});
