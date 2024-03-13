import { mongodb } from "~/server/database/mongo";
import { isObject } from "lodash-es";

type Log = object & {
  metadata?: string;
};

/**
 * timestamp: 时间戳
 * metadata: 日志元数据
 */
export const logs = mongodb.collection("logs");

export const writeLog = async (param: Log) => {
  if (!isObject(param)) return;
  await logs.insertOne({
    ...param,
    timestamp: new Date(),
  });
};
