import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);
  if (token && typeof token === "string") {
    setCookie(event, "token", token);
  }
  return checkUser(event);
});
