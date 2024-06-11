export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
  ],

  ui: {
    icons: ["tabler"],
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/api/**": { cors: true },
  },
});
