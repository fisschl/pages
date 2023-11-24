import { checkUser } from "../utils/user";
import { connect } from "../utils/redis";

export default defineEventHandler(async (event) => {
  await connect();
  const { token } = getQuery(event);
  return checkUser(event, token);
});
