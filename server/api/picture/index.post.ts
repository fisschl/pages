import { first } from "lodash-es";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { typeid } from "typeid-js";
import { counselor } from "~/server/api/picture/download";
import { extname } from "node:path";
import { database } from "~/server/database/postgres";

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name, type } = await readValidatedBody(event, QuerySchema.parse);
  const id = typeid().toString() + extname(name);
  const items = await database
    .insert(pictures)
    .values({
      id,
      content_type: type,
      name: name,
      user_id: user.id,
    })
    .returning();
  const item = first(items);
  if (!item) throw createError({ status: 500 });
  const { url } = await counselor(`/storage/upload`, {
    query: { key: `server/picture/${item.id}`, type: type },
  });
  return { url, ...item };
});
