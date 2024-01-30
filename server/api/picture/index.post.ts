import { first } from "lodash-es";
import { z } from "zod";
import { db } from "~/server/utils/db";
import { oss } from "~/server/utils/oss";
import { checkUser } from "~/server/utils/password";

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
  const url = oss.signatureUrl(`server/picture/${item.id}`, {
    method: "PUT",
    "Content-Type": type,
  });
  return { url, ...item };
});
