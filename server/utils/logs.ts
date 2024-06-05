import { database } from "~/server/database/postgres";
import { isObject } from "lodash-es";

class KnowError extends Error {}

const retry = async (task: () => Promise<void>, max: number): Promise<void> => {
  const run = async (count: number): Promise<void> => {
    if (count > max) throw new Error("到达最大重试次数");
    try {
      await task();
    } catch (e) {
      if (e instanceof KnowError) return run(count + 1);
      throw e;
    }
  };
  await run(1);
};

export const log = async (label: string, content: unknown): Promise<void> => {
  content = isObject(content) ? JSON.stringify(content) : String(content);
  const write = async () => {
    try {
      await database.$executeRaw`INSERT INTO log (time, label, content)
                                 VALUES (now(), ${label}, ${content})`;
    } catch (e) {
      const message = String(e);
      if (message.includes("23505")) throw new KnowError("主键冲突");
      throw e;
    }
  };
  await retry(write, 16);
};
