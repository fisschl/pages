import { isString, pick, throttle } from "lodash-es";
import { checkUser } from "~/server/api/login";
import { formatISO, parseISO } from "date-fns/esm";
import { prisma, redis } from "~/server/api/user";
import { MeiliSearch } from "meilisearch";

export interface ArticleSearchResult {
  id: string;
  name: string;
  body: string;
  update_time: string;
  shared: boolean;
}

const createMeiliSearchArticlesIndex = () => {
  const index = meilisearch.index("articles");
  if (process.env.REFRESH === "true") {
    console.log("Refreshing Articles Index");
    index.updateFilterableAttributes(["users"]);
    index.updateSearchableAttributes(["update_time"]);
  }
  return index;
};
export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});
export const indexArticles = createMeiliSearchArticlesIndex();
export const trySyncArticlesIndex = throttle(async () => {
  const currentTime = new Date();
  const lastSyncTimeISO = await redis.getSet(
    "meilisearch:articles:sync:time",
    formatISO(currentTime),
  );
  const lastSyncTime = parseISO(lastSyncTimeISO || "2023-10-24T19:21:54+08:00");
  // 删除已删除的
  const deletedItems = await prisma.article.findMany({
    where: { deleted: true },
    select: { id: true },
  });
  for (const { id } of deletedItems) {
    await indexArticles.deleteDocument(id);
    await prisma.article.delete({ where: { id } });
  }
  // 增量同步
  const items = await prisma.article.findMany({
    where: {
      update_time: { gte: lastSyncTime, lte: currentTime },
      deleted: false,
    },
    include: {
      users: { select: { id: true } },
    },
  });
  if (!items.length) return;
  const documents = items.map((item) => {
    const users = item.users.map((user) => user.id);
    return {
      ...pick(item, ["id", "name", "update_time", "shared"]),
      body: item.body.replace(/<[^>]+>/g, " "),
      users,
    };
  });
  await indexArticles.addDocuments(documents, { primaryKey: "id" });
  console.log("Sync Articles Index Success", documents.length);
}, 5 * 1000);

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = getQuery(event);
  if (!query.search) query.search = "";
  if (!isString(query.search)) return;
  const { hits } = await indexArticles.search<ArticleSearchResult>(
    query.search,
    {
      filter: `users = ${user.id}`,
      sort: query.search ? undefined : ["update_time:desc"],
      attributesToHighlight: ["body"],
      attributesToCrop: ["body"],
      cropLength: 20,
      attributesToRetrieve: ["id", "name", "body", "update_time", "shared"],
    },
  );
  trySyncArticlesIndex();
  return hits;
});
