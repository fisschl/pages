import { MoonshotBaseClient } from "~/server/api/translate";
import { parseMarkdown } from "~/server/utils/markdown";

export const fileMoonshotContent = async (id: string) => {
  return MoonshotBaseClient.files.content(id).then((res) => res.json());
};

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  const result = await fileMoonshotContent(id);
  result.html = await parseMarkdown(result.content);
  return result;
});
