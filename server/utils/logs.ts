import { database } from "~/server/database/postgres";
import { isObject, isString } from "lodash-es";

export const log = async (label: string, content: unknown): Promise<void> => {
  content = isString(content)
    ? content
    : isObject(content)
      ? JSON.stringify(content)
      : String(content);
  try {
    await database.$executeRaw`INSERT INTO log (time, label, content)
      VALUES (now(), ${label}, ${content})`;
  } catch (e) {
    const message = String(e);
    // 主键冲突，重试。
    if (message.includes("23505")) {
      setImmediate(() => log(label, content));
      return;
    }
    throw e;
  }
};
