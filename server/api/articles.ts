import { isString, pick, throttle } from "lodash-es";
import { meilisearch } from "../utils/meilisearch";
import { checkUser } from "../utils/user";

export const articlesIndex = meilisearch.index("articles");

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = getQuery(event);
  if (!query.search) query.search = "";
  if (!isString(query.search)) return;
  const { hits } = await articlesIndex.search(query.search, {
    filter: `users = ${user.id}`,
    sort: query.search ? undefined : ["select_time:desc"],
  });
  return hits;
});

// index.updateFilterableAttributes(["name"]);
// index.updateSortableAttributes(["select_time"]);

const syncArticle = throttle(async () => {
  const lastSyncTime = await redis.get("meilisearch:articles:sync:time");
  if (!lastSyncTime) {
    await redis.set("meilisearch:articles:sync:time", Date.now());
    const dbList = await db.article.findMany();
    const list = dbList.map((article) => {
      const item = pick(article, ["id", "name", "body", "select_time"]);
      item.body = item.body.replace(/<[^>]+>/g, " ");
      return item;
    });
    await articlesIndex.deleteAllDocuments();
    await articlesIndex.addDocuments(list, { primaryKey: "id" });
    return;
  }

  const deletedItems = await db.article.findMany({
    where: { deleted: true },
    select: { id: true },
  });
  for (const { id } of deletedItems) {
    await articlesIndex.deleteDocument(id);
    await db.article.delete({ where: { id } });
  }
}, 5 * 1000);
