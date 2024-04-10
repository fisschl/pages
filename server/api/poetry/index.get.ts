import { object, parse, string } from "valibot";
import { parseMarkdown } from "../markdown";
import type { Poetry } from "./poetries";
import { poetriesIndex } from "./poetries";

const RequestQuerySchema = object({
  id: string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, (value) =>
    parse(RequestQuerySchema, value),
  );
  const item = await poetriesIndex.getDocument<Poetry>(id);
  item.content = await parseMarkdown(item.content);
  return item;
});
