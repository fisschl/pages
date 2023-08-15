import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/main",
    },
    {
      path: "/gpu",
      component: () => import("@/pages/GpuView.vue"),
    },
    {
      path: "/markdown",
      component: () => import("@/pages/markdown/MarkdownView.vue"),
    },
    {
      path: "/main",
      component: () => import("@/layout/MainLayout.vue"),
      children: [
        {
          path: "",
          component: () => import("@/pages/MainView.vue"),
        },
        {
          path: "top",
          component: () => import("@/pages/TopSearchView.vue"),
        },
      ],
    },
  ],
});

export default router;
