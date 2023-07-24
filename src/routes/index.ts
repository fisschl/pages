import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/gpu",
    },
    {
      path: "/gpu",
      component: () => import("@/pages/GpuView.vue"),
    },
    {
      path: "/markdown",
      component: () => import("@/pages/markdown/MarkdownView.vue"),
    },
  ],
});

export default router;
