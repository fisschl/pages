import { z } from "zod";
import { pick } from "lodash-es";
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

const RequestSchema = z.object({
  keyword: z.string().default(""),
  offset: z.string().default("0"),
  library: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { keyword, offset, library } = await getValidatedQuery(
    event,
    RequestSchema.parse,
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
