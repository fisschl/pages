import { io } from "socket.io-client";
import { once } from "lodash-es";

export const socket = once(() => {
  return markRaw(io("https://bronya.world"));
});
