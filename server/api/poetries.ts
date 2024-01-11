import { z } from "zod";
import { pick } from "lodash-es";
import { getOptionsQueryFilter, OptionsQuerySchema } from "~/utils/query";
import { meilisearch } from "~/server/utils/meilisearch";

const QuerySchema = z.object({
  keyword: z.string().default(""),
  offset: z.string().default("0"),
  library: OptionsQuerySchema,
});

export const poetriesIndex = meilisearch.index("poetries");

export default defineEventHandler(async (event) => {
  const { keyword, offset, library } = await getValidatedQuery(
    event,
    QuerySchema.parse,
  );
  const filter = getOptionsQueryFilter("library", library);
  const res = await poetriesIndex.search(keyword, {
    limit: 64,
    offset: parseInt(offset),
    filter,
    attributesToCrop: ["content"],
    cropLength: 64,
    attributesToHighlight: ["content"],
  });
  return res.hits.map((item) => {
    Object.assign(item, pick(item._formatted, "content"));
    delete item._formatted;
    return item;
  });
});
