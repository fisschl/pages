import { nanoid } from "nanoid";
import { $id } from "~/server/database/schema";

export const $token = () => {
  return $id() + nanoid(24);
};
