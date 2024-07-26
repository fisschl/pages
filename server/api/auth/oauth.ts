import { appendParams } from "~/utils/query";

const { GITEE_AUTH_CLIENT_ID } = process.env;

export default defineEventHandler(async (event) => {
  const target = appendParams("https://gitee.com/oauth/authorize", {
    client_id: GITEE_AUTH_CLIENT_ID,
    redirect_uri: "https://bronya.world/login",
    response_type: "code",
  });
  return sendRedirect(event, target);
});
