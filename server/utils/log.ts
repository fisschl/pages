import { mongodb } from "~/server/database/mongo";
import { isObject } from "lodash-es";

/**
 * timestamp: 时间戳
 * metadata: 日志元数据
 */
export const logs = mongodb.collection("logs");
export const writeLog = async (param: {
  metadata: any;
  [key: string]: any;
}) => {
  if (!isObject(param)) return;
  await logs.insertOne({
    ...param,
    timestamp: new Date(),
    metadata: param.metadata || "common",
  });
};
