import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);
  return checkUser(event, token);
});
