import { parseMarkdown } from "../markdown";
import type { Poetry } from "./poetries";
import { poetriesIndex } from "./poetries";
import { z } from "zod";

const RequestQuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, RequestQuerySchema.parse);
  const item = await poetriesIndex.getDocument<Poetry>(id);
  item.content = await parseMarkdown(item.content);
  return item;
});
