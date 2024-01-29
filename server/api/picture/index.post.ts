import { z } from "zod";
import { oss } from "~/server/utils/oss";
import { extname } from "node:path";
import { checkUser } from "~/server/utils/password";
import { first } from "lodash-es";

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const picture_key = (id: string, name: string) => {
  return `server/picture/${id + extname(name)}`;
};

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name, type } = await getValidatedQuery(event, QuerySchema.parse);
  const res = await db
    .insert(pictures)
    .values({ content_type: type, name: name, user_id: user.id })
    .returning();
  const item = first(res);
  if (!item) throw createError({ status: 500 });
  const url = oss.signatureUrl(picture_key(item.id, name), {
    method: "PUT",
    "Content-Type": type,
  });
  return { url, id: item.id };
});
