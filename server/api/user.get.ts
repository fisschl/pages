import { checkUser } from "~/server/utils/password";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  user.password = "******";
  return user;
});
