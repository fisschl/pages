import { typeid } from "typeid-js";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";

const QuerySchema = z.object({
  type: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { type } = await readValidatedBody(event, QuerySchema.parse);
  const avatar = typeid().toString();
  const URL = oss.signatureUrl(`server/avatar/${avatar}`, {
    method: "PUT",
    "Content-Type": type,
  });
  return { avatar, URL };
});
