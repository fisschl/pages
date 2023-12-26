import { MeiliSearch } from "meilisearch";
import { z } from "zod";
import { pick } from "lodash-es";
import { getOptionsQueryFilter, OptionsQuerySchema } from "~/utils/query";

const QuerySchema = z.object({
  keyword: z.string().default(""),
  offset: z.number().default(0),
  library: OptionsQuerySchema,
});

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const poetriesIndex = meilisearch.index("poetries");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { keyword, offset, library } = QuerySchema.parse(query);
  const filter = getOptionsQueryFilter("library", library);
  const res = await poetriesIndex.search(keyword, {
    limit: 24,
    offset,
    filter,
    attributesToCrop: ["content"],
    cropLength: 50,
    attributesToHighlight: ["content"],
  });
  return res.hits.map((item) => {
    Object.assign(item, pick(item._formatted, "content"));
    delete item._formatted;
    return item;
  });
});
