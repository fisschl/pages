import { typeid } from "typeid-js";

export default defineEventHandler(async () => {
  return {
    id: typeid().toString(),
  };
});
