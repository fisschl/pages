import "dotenv/config";

export default defineNuxtConfig({
  modules: [
    process.env.NODE_ENV === "development" ? "@nuxt/devtools" : false,
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    process.env.NODE_ENV === "development" ? "@nuxt/eslint" : false,
  ],

  ui: {
    icons: ["tabler"],
  },

  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://static.bronya.world",
        },
        {
          rel: "stylesheet",
          href: "https://static.bronya.world/font/font.css",
        },
      ],
      script: [
        {
          src: "https://static.bronya.world/npm/scrollyfills/dist/scrollyfills.modern.js",
          async: true,
          type: "module",
        },
      ],
    },
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/api/**": { cors: true },
  },
});
