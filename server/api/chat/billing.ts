import { subDays } from "date-fns";
import { and, asc, desc, gte, lt, lte } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { last } from "lodash-es";
import type { input } from "zod";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { processor } from "~/server/database/redis";
import { ai_billing } from "~/server/database/schema";

export const InsertAiBillingSchema = createInsertSchema(ai_billing);

const upsert_residual = async () => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;
  const fetch_option = {
    baseURL: OPENAI_PROXY_URL,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  };
  const usage_fetch_res = await $fetch<object>(
    "/dashboard/billing/usage",
    fetch_option,
  );
  const subscription_fetch_res = await $fetch<object>(
    "/dashboard/billing/subscription",
    fetch_option,
  );
  const FetchSchema = z.object({
    total_usage: z.number(),
    hard_limit_usd: z.number(),
  });
  const fetch_res = FetchSchema.parse({
    ...usage_fetch_res,
    ...subscription_fetch_res,
  });
  fetch_res.total_usage = fetch_res.total_usage / 100;
  const value: input<typeof InsertAiBillingSchema> = {
    date: new Date().toISOString().slice(0, 10),
    residual: fetch_res.hard_limit_usd - fetch_res.total_usage,
    usage: 0,
  };
  const yesterday = await database.query.ai_billing.findFirst({
    where: lt(ai_billing.date, value.date),
    orderBy: desc(ai_billing.date),
  });
  if (yesterday) {
    value.usage = yesterday.residual - value.residual;
  }
  await database.insert(ai_billing).values(value).onConflictDoUpdate({
    target: ai_billing.date,
    set: value,
  });
};

Object.assign(processor, { upsert_residual });

export default defineEventHandler(async () => {
  const right = new Date();
  const right_str = right.toISOString().slice(0, 10);
  const left = subDays(right, 12);
  const list = await database.query.ai_billing.findMany({
    where: and(
      gte(ai_billing.date, left.toISOString().slice(0, 10)),
      lte(ai_billing.date, right_str),
    ),
    orderBy: asc(ai_billing.date),
  });
  const last_one = last(list);
  const today: (typeof list)[number] = {
    date: right_str,
    residual: last_one?.residual || 0,
    usage: 0,
  };
  if (last_one?.date === today.date) {
    Object.assign(today, last_one);
  }
  return { list, today };
});
