import { isString } from "lodash-es";
import { MeiliSearch } from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const poetriesIndex = meilisearch.index("poetries");

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const keyword = isString(query.keyword) ? query.keyword : "";
  const limit = Number(query.limit) || 32;
  const offset = Number(query.offset) || 0;
  const filter: string[] = [];
  const library = query.library?.toString();
  if (library) {
    filter.push(`library = ${library}`);
  }
  return poetriesIndex.search<any>(keyword, {
    limit,
    offset,
    filter,
  });
});
