import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { database } from "~/server/database/postgres";
import { pictures } from "~/server/database/schema";
import { nanoid } from "nanoid";
import { redis } from "~/server/database/redis";

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  await database
    .delete(pictures)
    .where(and(eq(pictures.user_id, user.id), eq(pictures.id, id)));
  const token = nanoid();
  await redis.set(
    token,
    JSON.stringify({
      key: `server/picture/${id}`,
    }),
    { EX: 10 },
  );
  return { token };
});
