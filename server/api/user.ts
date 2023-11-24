import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
