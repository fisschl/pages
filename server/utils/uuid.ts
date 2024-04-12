import { base58 } from "@scure/base";

export const timeBytes = () => {
  const time = BigInt(Date.now());
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, time);
  return new Uint8Array(buffer);
};

export const uuid = (suffix = 8) => {
  const time = timeBytes();
  const random = new Uint8Array(suffix);
  crypto.getRandomValues(random);
  const bytes = new Uint8Array([...time, ...random]);
  return base58.encode(bytes);
};
