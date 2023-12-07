import { typeid } from "typeid-js";
import { MeiliSearch } from "meilisearch";
import chuci from "./chuci.json" assert { type: "json" };

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = meilisearch.index("poetries");

await index.deleteAllDocuments();

const chuciDocs = chuci.map((item) => ({
  ...item,
  library: "楚辞",
  id: typeid().toString(),
}));

await index.addDocuments(chuciDocs);

