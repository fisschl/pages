// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/content",
    "@pinia/nuxt",
  ],
  app: {},
  devtools: { enabled: true },
  ui: {
    icons: ["tabler"],
  },
});
