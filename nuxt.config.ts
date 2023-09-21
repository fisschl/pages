// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxt/ui", "@vueuse/nuxt"],
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
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/canvas-confetti/dist/confetti.browser.min.js",
          async: true,
        },
      ],
    },
  },
  devtools: { enabled: true },
  ui: {
    icons: ["tabler"],
  },
});
