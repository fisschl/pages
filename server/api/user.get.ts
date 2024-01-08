import { checkUser } from "./session.post";

export default defineEventHandler(async (event) => {
  return checkUser(event);
});

