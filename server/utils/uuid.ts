import { base58 } from "@scure/base";
import { randomBytes } from "node:crypto";

export const timeBytes = () => {
  const time = BigInt(Date.now());
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, time);
  return new Uint8Array(buffer);
};

export const uuid = (suffix = 8) => {
  const bytes = new Uint8Array([...timeBytes(), ...randomBytes(suffix)]);
  return base58.encode(bytes);
};
