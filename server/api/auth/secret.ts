import { use401, useUserSecret } from "~/server/utils/user";

export default defineEventHandler(async (event) => {
  const id = await use401(event);
  const secret = await useUserSecret(id);
  return { secret };
});
