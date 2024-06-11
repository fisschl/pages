import { createClient } from "@clickhouse/client";
import { throttle } from "lodash-es";

export const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL,
});

const logs_cache: Record<string, string>[] = [];

const logs_write = throttle(async () => {
  const values = [...logs_cache];
  logs_cache.length = 0;
  await clickhouse.insert({
    table: "logs",
    values: values,
    format: "JSONEachRow",
  });
}, 1000);

export const writeLog = async (label: string, content: string) => {
  logs_cache.push({ label, content });
  await logs_write();
};
