import { hashPassword } from "./user.post";
import { checkUser } from "./session.post";
import { prisma } from "~/server/utils/db";
import { redis } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const req = await readBody(event);
  const password = hashPassword(req.password);
  const user = await prisma.user.update({
    where: { id },
    data: { ...req, password },
  });
  await redis.del(user.id);
  return user;
});
