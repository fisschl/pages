import { z } from "zod";
import { oss } from "~/server/utils/oss";
import { checkUser } from "~/server/utils/password";
import { first } from "lodash-es";
import { db } from "~/server/utils/db";
import { picture_key } from "~/utils/image";

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name, type } = await readValidatedBody(event, QuerySchema.parse);
  const items = await db
    .insert(pictures)
    .values({ content_type: type, name: name, user_id: user.id })
    .returning();
  const item = first(items);
  if (!item) throw createError({ status: 500 });
  const url = oss.signatureUrl(picture_key(item.id), {
    method: "PUT",
    "Content-Type": type,
  });
  return { url, ...item };
});