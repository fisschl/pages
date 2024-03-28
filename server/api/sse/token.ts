import { useToken } from "~/server/api/auth/index.post";

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  return { token };
});
