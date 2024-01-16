import { z } from "zod";
import { oss } from "~/server/utils/oss";

import { checkUser } from "~/server/utils/password";

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const profileKey = (userId: string, name: string) => {
  return `server/profile/${userId}/${name}`;
};

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const { name, type } = await getValidatedQuery(event, QuerySchema.parse);
  const url = oss.signatureUrl(profileKey(id, name), {
    method: "PUT",
    "Content-Type": type,
  });
  return { url };
});
