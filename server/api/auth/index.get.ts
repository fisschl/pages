import { useUser } from "./index.post";

export default defineEventHandler(async (event) => {
  return useUser(event);
});
