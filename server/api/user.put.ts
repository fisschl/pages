import { hashPassword } from "./user.post";
import { checkUser } from "./session.post";
import { prisma, redis } from "~/server/api/user.get";

export default defineEventHandler(async (event) => {
  const { id, token } = await checkUser(event);
  const req = await readBody(event);
  const password = hashPassword(req.password);
  const user = await prisma.user.update({
    where: { id },
    data: { ...req, password },
  });
  await redis.json.set(token, "$", user);
  return { message: "更新成功" };
});
