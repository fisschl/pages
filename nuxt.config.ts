export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/content",
    "@pinia/nuxt",
  ],
  ui: {
    icons: ["tabler"],
  },
  nitro: {
    esbuild: {
      options: {
        target: "ESNext",
      },
    },
  },
});
