import { createClient } from "redis";

export const redis = (() => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  client.connect().then(() => console.log("Redis Connected"));
  return client;
})();

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
