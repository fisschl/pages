import { checkUser } from "../utils/user";
import { connect } from "../utils/redis";

export default defineEventHandler(async (event) => {
  await connect();
  return checkUser(event);
});
