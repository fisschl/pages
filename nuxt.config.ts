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
          rel: "stylesheet",
          href: "https://cdn.fisschl.world/static/MiSans/font.css",
        },
      ],
    },
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/api/**": { cors: true },
  },
});
