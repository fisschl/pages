import { typeid } from "typeid-js";
import { nanoid } from "nanoid";
import type { H3Event } from "h3";
import { isString } from "lodash-es";

export default defineEventHandler(async (event) => {
  let token = tokenFromContext(event);
  if (token) return { message: "Link Start" };
  token = typeid().toString() + nanoid(24);
  setCookie(event, "token", token);
  return { message: "Link Start" };
});

/**
 * 从请求中获取 token
 */
export const tokenFromContext = (event: H3Event) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const header = getHeader(event, "token");
  if (header) return header;
  const query = getQuery(event);
  if (query.token && isString(query.token)) return query.token;
  return undefined;
};
