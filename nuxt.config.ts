// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxtjs/eslint-module",
    "@nuxt/image",
    "@nuxt/content",
    "@pinia/nuxt",
  ],
  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://cdn.fisschl.world",
        },
        {
          rel: "stylesheet",
          href: "https://cdn.fisschl.world/HarmonyOS_Sans_SC/font.css",
        },
        {
          rel: "stylesheet",
          href: "https://cdn.fisschl.world/LXGWWenKai/font.css",
        },
      ],
      script: [],
    },
  },
  devtools: { enabled: true },
  ui: {
    icons: ["tabler"],
  },
});
