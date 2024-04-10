import { pick } from "lodash-es";
import { fallback, object, optional, parse, string } from "valibot";
import { meilisearch } from "~/server/database/meilisearch";

export interface Poetry {
  id: string;
  library: string;
  author?: string;
  content: string;
  title: string;
  index?: number;
  tags?: string[];
}

export const poetriesIndex = meilisearch.index("poetries");

export const meilisearchQueryFilter = (key: string, items?: string[]) => {
  const res = items?.filter(Boolean);
  if (!res || !res.length) return undefined;
  return `${key} IN [${res.join()}]`;
};

const RequestSchema = object({
  keyword: fallback(string(), ""),
  offset: fallback(string(), "0"),
  library: optional(string()),
});

export default defineEventHandler(async (event) => {
  const { keyword, offset, library } = await getValidatedQuery(event, (value) =>
    parse(RequestSchema, value),
  );
  const res = await poetriesIndex.search<Poetry>(keyword, {
    limit: 32,
    offset: parseInt(offset) || 0,
    filter: meilisearchQueryFilter("library", library?.split(",")),
    attributesToCrop: ["content"],
    cropLength: 32,
    attributesToHighlight: ["content"],
  });
  return res.hits.map((item) => {
    Object.assign(item, pick(item._formatted, "content"));
    delete item._formatted;
    return item;
  });
});
