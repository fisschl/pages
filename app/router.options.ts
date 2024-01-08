import type { RouteRecordRaw } from "#vue-router";
import type { RouterConfig } from "@nuxt/schema";

const index: RouteRecordRaw = {
  path: "/",
  redirect: "/main/home",
};

const router: RouterConfig = {
  routes: (routes) => {
    return [index, ...routes];
  },
};

export default router;
