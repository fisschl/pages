import { v7 as uuid } from "uuid";

export default defineEventHandler(async () => {
  const id = uuid();
  return { uuid: id };
});
