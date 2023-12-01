import { MeiliSearch } from "meilisearch";

const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const articlesIndex = meilisearch.index("articles");

await articlesIndex.updateFilterableAttributes(["users"]);
await articlesIndex.updateSortableAttributes(["update_time"]);
