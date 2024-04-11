import { pick } from "lodash-es";
import { meilisearch } from "~/server/database/meilisearch";
import { z } from "zod";

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

const request_schema = z.object({
  keyword: z.string().optional(),
  offset: z.coerce.number(),
  library: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { keyword, offset, library } = await getValidatedQuery(
    event,
    request_schema.parse,
  );
  const res = await poetriesIndex.search<Poetry>(keyword, {
    limit: 32,
    offset: offset,
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
