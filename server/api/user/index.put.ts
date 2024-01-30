import { eq } from "drizzle-orm";
import { first, pick } from "lodash-es";
import { basename, extname } from "node:path";
import sharp from "sharp";
import { sanitize } from "~/server/utils/db";
import { checkUser, hashPassword } from "~/server/utils/password";
import { redis } from "~/server/utils/redis";
import { UserUpdateSchema } from "~/server/utils/schema";
import { picture_key } from "~/utils/image";

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
  if (body.avatar_id) {
    const item = await db.query.pictures.findFirst({
      where: eq(pictures.id, body.avatar_id),
    });
    if (!item) throw createError({ status: 400 });
    const KEY = picture_key(body.avatar_id);
    const { content } = await oss.get(KEY);
    const result = await sharp(content).webp().toBuffer();
    await oss.put(KEY, result);
    item.name = basename(item.name, extname(item.name)) + ".webp";
    item.content_type = "image/webp";
    await db
      .update(pictures)
      .set(pick(item, ["name", "content_type"]))
      .where(eq(pictures.id, body.avatar_id));
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
