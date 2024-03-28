export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@element-plus/nuxt",
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

  elementPlus: {
    themes: ["dark"],
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/graph/**": { ssr: false },
  },

  css: ["@/assets/css/global.css"],

  devtools: {
    timeline: {
      enabled: true,
    },
  },
});
