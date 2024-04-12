import { database } from "~/server/database/postgres";
import { sanitize } from "~/server/utils/purify";
import { uuid } from "../../utils/uuid";
import { z } from "zod";
import { argon2id } from "hash-wasm";

const request_schema = z.object({
  name: z.string(),
  password: z.string(),
  role: z.undefined(),
});

export const hashPassword = async (password: string) => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: "encoded",
  });
};

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
