import { typeid } from "typeid-js";
import { base58 } from "@scure/base";
import { nanoid } from "nanoid";

export const $id = () => {
  const bytes = typeid().toUUIDBytes();
  return base58.encode(bytes);
};
export const $token = () => {
  return $id() + nanoid(24);
};
