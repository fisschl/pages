import { subDays } from "date-fns";
import { and, asc, gte, lte } from "drizzle-orm";
import { last, throttle } from "lodash-es";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { ai_billing } from "~/server/database/schema";

const FetchSchema = z.object({
  total_usage: z.number(),
  hard_limit_usd: z.number(),
});

export const upsert_residual = throttle(async () => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;
  const usage_fetch_res = await $fetch<object>("/dashboard/billing/usage", {
    baseURL: OPENAI_PROXY_URL,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });
  const subscription_fetch_res = await $fetch<object>(
    "/dashboard/billing/subscription",
    {
      baseURL: OPENAI_PROXY_URL,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    },
  );
  const fetch_res = FetchSchema.parse({
    ...usage_fetch_res,
    ...subscription_fetch_res,
  });
  fetch_res.total_usage = fetch_res.total_usage / 100;
  const residual = fetch_res.hard_limit_usd - fetch_res.total_usage;
  const now = new Date().toISOString().slice(0, 10);
  const value = { residual: Math.floor(residual) };
  await database
    .insert(ai_billing)
    .values({ ...value, date: now })
    .onConflictDoUpdate({
      target: ai_billing.date,
      set: value,
    });
}, 10 * 1000);

export interface Billing {
  date: string;
  residual: number;
  usage: number;
}

export default defineEventHandler(async () => {
  const right = new Date();
  const right_str = right.toISOString().slice(0, 10);
  const left = subDays(right, 7);
  const list = await database.query.ai_billing.findMany({
    where: and(
      gte(ai_billing.date, left.toISOString().slice(0, 10)),
      lte(ai_billing.date, right_str),
    ),
    orderBy: asc(ai_billing.date),
  });
  const result: Billing[] = [];
  list.forEach((item, index) => {
    const last = list[index - 1];
    if (!last) return;
    const usage = last.residual - item.residual;
    result.push({ ...item, usage });
  });
  const last_one = last(result);
  const today: Billing = {
    date: right_str,
    residual: last_one?.residual || 0,
    usage: 0,
  };
  if (last_one?.date === today.date) {
    today.usage = last_one.usage;
  }
  return {
    list: result,
    today,
  };
});
