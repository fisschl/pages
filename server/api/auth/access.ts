import { isString } from "lodash-es";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { useToken } from "~/server/utils/user";
import { DAY, redis } from "~/server/database/redis";

const { GITEE_AUTH_CLIENT_ID, GITEE_AUTH_CLIENT_SECRET } = process.env;

const acc_schema = z.object({
  access_token: z.string(),
});

const user_schema = z.object({
  id: z.number().min(1),
  login: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  email: z.string(),
});

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);
  if (!code || !isString(code)) throw createError({ status: 400 });
  const uri = new URL("https://gitee.com/oauth/token");
  const { searchParams } = uri;
  searchParams.append("grant_type", "authorization_code");
  searchParams.append("code", code);
  searchParams.append("client_id", GITEE_AUTH_CLIENT_ID!);
  searchParams.append("redirect_uri", "https://bronya.world/login");
  searchParams.append("client_secret", GITEE_AUTH_CLIENT_SECRET!);
  const acc_res = await $fetch(uri.toString(), {
    method: "POST",
    onResponseError: async (ctx) => {
      console.log(ctx.response);
    },
  });
  const acc = acc_schema.parse(acc_res);
  const user_res = await $fetch("https://gitee.com/api/v5/user", {
    query: {
      access_token: acc.access_token,
    },
  });
  const gitee_user_data = user_schema.parse(user_res);
  const id = gitee_user_data.id.toString();
  const user = await database.user.upsert({
    create: { ...gitee_user_data, id },
    update: { ...gitee_user_data, id: undefined, last_login: new Date() },
    where: { id },
  });
  const token = useToken(event);
  await redis.hset(token, { user: user.id });
  await redis.expire(token, 30 * DAY);
  return user;
});
