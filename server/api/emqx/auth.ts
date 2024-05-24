import { z } from "zod";
import { redis } from "~/server/database/redis";

const request_schema = z.object({
  /**
   * 用户的 id
   */
  username: z.string(),
  /**
   * 用户的 token
   */
  password: z.string(),
});

// http://pages:3000/api/emqx/auth

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  const id = await redis.hget(body.password, "user");
  if (id === body.username) return { result: "allow" };
  return { result: "deny" };
});
