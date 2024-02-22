import { TypeOf, z } from "zod";

export const PageQuerySchema = z.object({
  page: z.string().default("1"),
  pageSize: z.string().default("64"),
});
export const limitOffset = (page: TypeOf<typeof PageQuerySchema>) => {
  return {
    limit: +page.pageSize,
    offset: (+page.page - 1) * +page.pageSize,
  };
};
