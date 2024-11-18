import { MoonshotBaseClient } from "~/server/api/translate";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  return await MoonshotBaseClient.files.content(id).then((res) => res.json());
});
