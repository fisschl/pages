import { redis } from "~/server/utils/redis";
import { checkUser, hashPassword } from "~/server/utils/password";
import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { UserUpdateSchema } from "../../utils/schema";
import { sanitize } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const body = await readValidatedBody(event, UserUpdateSchema.parse);
  if (body.password) {
    body.password = await hashPassword(body.password);
  } else {
    body.password = undefined;
  }
  if (body.name) {
    body.name = sanitize(body.name);
  } else {
    body.name = undefined;
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