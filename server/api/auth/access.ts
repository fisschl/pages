import { isString } from "lodash-es";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { useToken } from "~/server/utils/user";
import { DAY, redis, writeCache } from "~/server/database/redis";
import { consola } from "consola";

const { GITEE_AUTH_CLIENT_ID, GITEE_AUTH_CLIENT_SECRET } = process.env;

const oauth_token_schema = z.object({
  access_token: z.string(),
});

const fetch_user_schema = z.object({
  id: z.number().min(1),
  login: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  email: z.string(),
});

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);
  if (!code || !isString(code)) throw createError({ status: 400 });

  const fetchOAuthToken = async () => {
    const res = await $fetch("https://gitee.com/oauth/token", {
      method: "POST",
      query: {
        grant_type: "authorization_code",
        code,
        client_id: GITEE_AUTH_CLIENT_ID,
        redirect_uri: "URL_ADDRESS",
        client_secret: GITEE_AUTH_CLIENT_SECRET,
      },
    });
    return oauth_token_schema.parse(res);
  };

  const fetchUser = async () => {
    const { access_token } = await fetchOAuthToken();
    const res = await $fetch("https://gitee.com/api/v5/user", {
      query: { access_token },
    });
    return fetch_user_schema.parse(res);
  };

  const user_result = await fetchUser();
  const id = user_result.id.toString();

  const user = await database.user.upsert({
    create: { ...user_result, id },
    update: { ...user_result, id: undefined, last_login: new Date() },
    where: { id },
  });

  await writeCache(id, user);
  consola.info("用户登录授权", JSON.stringify(user));
  const token = useToken(event);
  await redis.hset(token, { user: user.id });
  await redis.expire(token, 30 * DAY);
  return user;
});
