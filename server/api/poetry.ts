import { isString } from "lodash-es";
import { poetriesIndex } from "./poetries";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const res = await poetriesIndex.getDocument(id);
  return res;
});
