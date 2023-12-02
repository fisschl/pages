import { isString, pick, throttle } from "lodash-es";
import { formatISO, parseISO } from "date-fns/esm";
import { prisma } from "./user";
import { MeiliSearch } from "meilisearch";
import { checkUser, redis } from "~/server/api/login";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});
export const articlesIndex = meilisearch.index("articles");

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = getQuery(event);
  if (!query.search) query.search = "";
  if (!isString(query.search)) return;
  const { hits } = await articlesIndex.search(query.search, {
    filter: `users = ${user.id}`,
    sort: query.search ? undefined : ["update_time:desc"],
    attributesToHighlight: ["name", "body"],
    attributesToCrop: ["body"],
    cropLength: 20,
    attributesToRetrieve: ["id", "name", "body", "update_time"],
  });
  syncArticle();
  return hits.map((item) => {
    delete item.users;
    return item;
  });
});

export const syncArticle = throttle(async () => {
  const lastSyncTimeISO = await redis.get("meilisearch:articles:sync:time");
  const lastSyncTime = parseISO(lastSyncTimeISO || "2023-10-24T19:21:54+08:00");
  const currentTime = new Date();
  await redis.set("meilisearch:articles:sync:time", formatISO(currentTime));
  // 删除已删除的
  const deletedItems = await prisma.article.findMany({
    where: { deleted: true },
    select: { id: true },
  });
  for (const { id } of deletedItems) {
    await articlesIndex.deleteDocument(id);
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
      ...pick(item, ["id", "name", "update_time"]),
      body: item.body.replace(/<[^>]+>/g, " "),
      users,
    };
  });
  await articlesIndex.addDocuments(documents, { primaryKey: "id" });
  console.log("Sync Articles Index Success", documents.length);
}, 5 * 1000);
