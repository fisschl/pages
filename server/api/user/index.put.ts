import { omit } from "lodash-es";
import { database } from "~/server/database/postgres";
import { use403 } from "~/server/utils/user";
import { hashPassword } from "./index.post";
import { z } from "zod";

export const input_schema = z
  .object({
    name: z.string(),
    password: z.string(),
    avatar: z.string().nullable(),
    role: z.string().nullable(),
  })
  .partial();

export default defineEventHandler(async (event) => {
  const id = await use403(event);
  const body = await readValidatedBody(event, input_schema.parse);
  // 密码应被散列
  if (body.password) body.password = await hashPassword(body.password);
  body.role = undefined;
  const item = await database.user.update({
    data: body,
    where: { id },
  });
  return omit(item, "password");
});
