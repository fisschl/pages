import { checkUser } from "~/server/api/session.post";
import { oss } from "./profile_upload";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const url = oss.signatureUrl(`server/profile/${user.id}/${user.profile}`);
  return sendRedirect(event, url);
});
