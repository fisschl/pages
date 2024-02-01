import { typeid } from "typeid-js";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { counselor } from "~/server/api/picture/download";
import { extname } from "node:path";

const QuerySchema = z.object({
  type: z.string(),
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { type, name } = await readValidatedBody(event, QuerySchema.parse);
  const avatar = typeid().toString() + extname(name);
  const url = await counselor<string>(`/oss/upload`, {
    query: { key: `server/avatar/${avatar}`, type: type },
  });
  return { avatar, url };
});
