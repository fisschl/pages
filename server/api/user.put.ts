import { hashPassword } from "./user.post";
import { checkUser, setUserCache } from "./session.post";
import { prisma } from "~/server/api/user.get";

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
  const req = await readBody(event);
  const password = hashPassword(req.password);
  const user = await prisma.user.update({
    where: { id },
    data: { ...req, password },
  });
  await setUserCache(user);
  return user;
});
