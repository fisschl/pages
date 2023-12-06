import { MeiliSearch } from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = meilisearch.index("articles");

await index.updateFilterableAttributes(["users"]);
await index.updateSearchableAttributes(["update_time"]);
