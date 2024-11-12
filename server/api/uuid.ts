import { v7 as uuid } from "uuid";

export default defineEventHandler(() => {
  const id = uuid();
  return { uuid: id };
});
