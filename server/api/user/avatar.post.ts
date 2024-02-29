import { typeid } from "typeid-js";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { extname } from "node:path";
import { database } from "~/server/database/postgres";
import { users } from "~/server/database/schema";
import { eq } from "drizzle-orm";

const QuerySchema = z.object({
  type: z.string(),
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { type, name } = await readValidatedBody(event, QuerySchema.parse);
  const avatar = typeid().toString() + extname(name);
  // const { url } = await counselor<Record<string, string>>(`/storage/upload`, {
  //   query: { key: `server/avatar/${avatar}`, type: type },
  // });
  // await counselor(`/storage/delete`, {
  //   method: "DELETE",
  //   query: { key: `server/avatar/${user.avatar}` },
  // });
  await database.update(users).set({ avatar }).where(eq(users.id, user.id));
  // return { avatar, url };
});
