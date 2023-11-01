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
          href: "https://cdn.fisschl.world/MiSans/font.css",
        },
      ],
      script: [],
    },
  },
  devtools: { enabled: true },
  ui: {
    icons: ["tabler"],
  },
  eslint: {
    fix: true,
  },
});
