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
      path: "/avatar-edit",
      component: () => import("@/pages/AvatarEditView.vue"),
    },
  ],
});

export default router;
