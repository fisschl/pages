import { poetriesIndex } from "./poetries";
import { parse } from "marked";
import { z } from "zod";

const RequestQuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, RequestQuerySchema.parse);
  const res = await poetriesIndex.getDocument(id);
  const { content } = res;
  res.content = await parse(content);
  return res;
});
