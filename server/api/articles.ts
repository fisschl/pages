import { isString } from "lodash-es";
import { meilisearch } from "../utils/meilisearch";
import { checkUser } from "../utils/user";

export const articles = meilisearch.index("articles");

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { search = "" } = getQuery(event);
  if (!isString(search)) return;
  const { hits } = await articles.search(search, {
    filter: `users = ${user.id}`,
    sort: search ? undefined : ["select_time:desc"],
  });
  return hits;
});
