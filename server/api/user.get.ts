import { checkUser } from "~/server/utils/password";

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
