import { typeid } from "typeid-js";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { extname } from "node:path";
import { database } from "~/server/database/postgres";
import { users } from "~/server/database/schema";
import { eq } from "drizzle-orm";
import { redis } from "~/server/database/redis";

const QuerySchema = z.object({
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name } = await readValidatedBody(event, QuerySchema.parse);
  const avatar = typeid().toString() + extname(name);
  await database.update(users).set({ avatar }).where(eq(users.id, user.id));
  await redis.del(user.id);
  return { avatar };
});
