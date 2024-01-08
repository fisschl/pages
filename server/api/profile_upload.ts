import { checkUser } from "~/server/api/session.post";
import { z } from "zod";
import { oss } from "~/server/utils/oss";

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const profileKey = (userId: string, name: string) => {
  return `server/profile/${userId}/${name}`;
};

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const query = getQuery(event);
  const { name, type } = QuerySchema.parse(query);
  const url = oss.signatureUrl(profileKey(id, name), {
    method: "PUT",
    "Content-Type": type,
  });
  return { url };
});
