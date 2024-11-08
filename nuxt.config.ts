export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
  ],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
});
