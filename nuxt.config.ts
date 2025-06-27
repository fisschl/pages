export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/mdc",
  ],
  ui: {
    fonts: false,
  },
  compatibilityDate: "2025-06-27",
  future: {
    compatibilityVersion: 4,
  },
});
