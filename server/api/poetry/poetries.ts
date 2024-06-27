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

const request_schema = z.object({
  keyword: z.string().optional(),
  library: z.string().optional(),
  offset: z.coerce.number().default(0),
});

export default defineEventHandler(async (event) => {
  const body = await getValidatedQuery(event, request_schema.parse);
  const filters: string[] = [];
  if (body.library) filters.push(`library IN [${body.library}]`);
  const res = await poetriesIndex.search<Poetry>(body.keyword, {
    limit: 32,
    offset: body.offset,
    filter: filters,
    attributesToCrop: ["content"],
    cropLength: 32,
    attributesToHighlight: ["content"],
  });
  return res.hits.map((item) => {
    const { _formatted, ...others } = item;
    if (_formatted?.content) others.content = _formatted.content;
    return others;
  });
});
