import { database } from "~/server/database/postgres";
import { z } from "zod";
import { extname } from "node:path";
import { uuid } from "~/server/utils/uuid";

import { checkUser } from "~/server/utils/user";

const request_schema = z.object({
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const body = await readValidatedBody(event, request_schema.parse);
  const key = `home/${user.id}/chat/${uuid() + extname(body.name)}`;
  await database.chat_file.create({
    data: { key },
  });
  return { key };
});
