import { MeiliSearch } from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = meilisearch.index("poetries");

await index.updateFilterableAttributes(["library", "author"]);
