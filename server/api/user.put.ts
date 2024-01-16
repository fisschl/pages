import { redis } from "~/server/utils/redis";
import { checkUser, hashPassword } from "~/server/utils/password";
import { UserInsertSchema } from "~/server/utils/schema";
import { eq } from "drizzle-orm";
import { first } from "lodash-es";

const BodySchema = UserInsertSchema.partial();

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const body = await readValidatedBody(event, BodySchema.parse);
  if (body.password) {
    body.password = await hashPassword(body.password);
  }
  const list = await db
    .update(users)
    .set(body)
    .where(eq(users.id, id))
    .returning();
  const item = first(list);
  if (!item) throw createError({ status: 400 });
  await redis.del(item.id);
  item.password = "******";
  return item;
});
