import type { Poetry} from "./poetries";
import { poetriesIndex } from "./poetries";
import { z } from "zod";

const RequestQuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, RequestQuerySchema.parse);
  const res = await poetriesIndex.getDocument<Poetry>(id);
  return res;
});
