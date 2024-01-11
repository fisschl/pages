import { isString } from "lodash-es";
import { poetriesIndex } from "./poetries";
import { parse } from "marked";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const res = await poetriesIndex.getDocument(id);
  const { content } = res;
  res.content = await parse(content);
  return res;
});
