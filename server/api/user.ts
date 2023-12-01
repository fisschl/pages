import { checkUser } from "../utils/user";

import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
