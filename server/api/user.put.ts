import { prisma } from "./session.get";
import { hashPassword } from "./user.post";
import { checkUser } from "./session.post";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const req = await readBody(event);
  const password = hashPassword(req.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { ...req, password },
  });
  return { message: "更新成功" };
});
