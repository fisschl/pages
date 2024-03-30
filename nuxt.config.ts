export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@element-plus/nuxt",
    "@nuxtjs/mdc",
    "@nuxt/eslint",
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

  mdc: {
    highlight: {
      theme: "vitesse-dark",
    },
  },
});
