import { z } from "zod";

const request_schema = z.object({
  /**
   * 用户的 id
   */
  username: z.string(),
  /**
   * 当前请求想要发布或订阅的主题（或主题过滤器）
   */
  topic: z.string(),
});

// http://pages:3000/api/emqx/access

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  if (body.topic.startsWith("public")) return { result: "allow" };
  if (body.username === body.topic) return { result: "allow" };
  return { result: "deny" };
});
