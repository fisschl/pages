import "dotenv/config";

const development = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  modules: [
    development ? "@nuxt/devtools" : false,
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    development ? "@nuxt/eslint" : false,
  ],

  ui: {
    icons: ["tabler"],
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/api/**": { cors: true },
  },
});
