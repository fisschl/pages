import { tryOnBeforeUnmount, tryOnMounted } from "@vueuse/core";
import { pull } from "lodash-es";

export type EmitHandler<T, K extends keyof T> = (
  e: T[K],
) => Promise<void> | void;

export type Listeners<T extends Record<string, unknown>> = {
  [K in keyof T]?: EmitHandler<T, K>[];
};

export class Emitter<T extends Record<string, unknown>> {
  readonly listeners: Listeners<T> = {};

  on<K extends keyof T>(key: K, handler: EmitHandler<T, K>) {
    tryOnMounted(() => {
      const list = this.listeners[key];
      if (list) list.push(handler);
      else this.listeners[key] = [handler];
    });
    tryOnBeforeUnmount(() => this.off(key, handler));
  }

  off<K extends keyof T>(key: K, handler?: EmitHandler<T, K>) {
    if (!handler) return (this.listeners[key] = undefined);
    const list = this.listeners[key];
    if (list) return pull(list, handler);
  }

  async emit<K extends keyof T>(key: K, e: T[K]) {
    const list = this.listeners[key];
    if (!list) return;
    return Promise.all(list.map((handler) => handler(e)));
  }
}
