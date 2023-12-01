import { PrismaClient } from "@prisma/client";
import { checkUser } from "~/server/api/login";

export const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
