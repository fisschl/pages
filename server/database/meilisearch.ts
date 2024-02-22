import { MeiliSearch } from "meilisearch";

const { MEILISEARCH_HOST, MEILISEARCH_API_KEY } = process.env;

export const meilisearch = new MeiliSearch({
  host: MEILISEARCH_HOST!,
  apiKey: MEILISEARCH_API_KEY,
});
