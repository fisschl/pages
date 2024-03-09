import { useCurrentUser } from "./index.post";

export default defineEventHandler(async (event) => {
  return useCurrentUser(event);
});
