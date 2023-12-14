import { MeiliSearch } from "meilisearch";
import { z } from "zod";
import { pick } from "lodash-es";

const QuerySchema = z.object({
  keyword: z.string().default(""),
  offset: z.number().default(0),
  library: z.string(),
});

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const poetriesIndex = meilisearch.index("poetries");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { keyword, offset, library } = QuerySchema.parse(query);
  const attributes = ["content", "paragraphs"];
  const res = await poetriesIndex.search(keyword, {
    limit: 24,
    offset,
    filter: `library = ${library}`,
    attributesToCrop: attributes,
    cropLength: 50,
    attributesToHighlight: attributes,
  });
  return res.hits.map((item) => {
    Object.assign(item, pick(item._formatted, attributes));
    delete item._formatted;
    return item;
  });
});
