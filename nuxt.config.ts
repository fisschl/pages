export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
  ],
  css: ["./assets/tailwind.css"],
  compatibilityDate: "2025-01-02",
  vite: {
    build: {
      cssMinify: false,
    },
  },
});
