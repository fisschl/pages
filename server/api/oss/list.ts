import { createError, defineEventHandler, getQuery } from "h3";
import type { ListObjectResult, ObjectMeta } from "ali-oss";
import { oss } from "./download";

import { useUser } from "~/server/utils/user";

const list_dir = async (prefix: string) => {
  const prefixes: string[] = [];
  const objects: ObjectMeta[] = [];
  const state: Partial<ListObjectResult> = {
    isTruncated: true,
  };
  while (state.isTruncated) {
    const result = await oss.list(
      {
        prefix,
        delimiter: "/",
        "max-keys": 1000,
        marker: state.nextMarker,
      },
      {},
    );
    if (result.prefixes) prefixes.push(...result.prefixes);
    if (result.objects) objects.push(...result.objects);
    state.isTruncated = result.isTruncated;
    state.nextMarker = result.nextMarker;
  }
  return { prefixes, objects };
};

export default defineEventHandler(async (event) => {
  const { prefix } = getQuery(event);
  if (typeof prefix !== "string") throw createError({ status: 400 });
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  if (!prefix.startsWith(`home/${user.id}`)) throw createError({ status: 403 });
  return list_dir(prefix);
});
