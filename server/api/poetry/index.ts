import { parseMarkdownCache } from "../../utils/markdown";
import type { Poetry } from "./poetries";
import { poetriesIndex } from "./poetries";
import { z } from "zod";

const request_schema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, request_schema.parse);
  const item = await poetriesIndex.getDocument<Poetry>(id);
  item.content = await parseMarkdownCache(item.content);
  return item;
});
