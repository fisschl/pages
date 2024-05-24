const { GITEE_AUTH_CLIENT_ID } = process.env;

export default defineEventHandler(async (event) => {
  const uri = new URL("https://gitee.com/oauth/authorize");
  const { searchParams } = uri;
  searchParams.append("client_id", GITEE_AUTH_CLIENT_ID!);
  searchParams.append("redirect_uri", "https://bronya.world/login");
  searchParams.append("response_type", "code");
  return sendRedirect(event, uri.toString());
});
