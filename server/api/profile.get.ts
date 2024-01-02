import { checkUser } from "~/server/api/session.post";
import { oss, profileKey } from "./profile_upload";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  if (!user.profile) return createError({ status: 404 });
  const url = oss.signatureUrl(profileKey(user.id, user.profile));
  return sendRedirect(event, url);
});
