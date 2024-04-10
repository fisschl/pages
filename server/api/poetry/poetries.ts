import { pick } from "lodash-es";
import { object, optional, parse, string } from "valibot";
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

export const searchQueryFilter = (key: string, items?: string[]) => {
  const list = items?.filter(Boolean);
  if (!list?.length) return undefined;
  return `${key} IN [${list.join()}]`;
};

const RequestSchema = object({
  keyword: optional(string()),
  offset: string(),
  library: optional(string()),
});

export default defineEventHandler(async (event) => {
  const { keyword, offset, library } = await getValidatedQuery(event, (value) =>
    parse(RequestSchema, value),
  );
  const res = await poetriesIndex.search<Poetry>(keyword, {
    limit: 32,
    offset: parseInt(offset),
    filter: searchQueryFilter("library", library?.split(",")),
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
