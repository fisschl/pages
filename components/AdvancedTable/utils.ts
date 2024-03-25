import type { MaybeRefOrGetter } from "vue";

export type UnRef<T> = T extends MaybeRefOrGetter<infer U> ? U : never;
