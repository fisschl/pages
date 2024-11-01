export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
  ],

  routeRules: {
    "/": { redirect: "/main" },
    "/api/**": { cors: true },
  },

  compatibilityDate: "2024-08-05",
});
