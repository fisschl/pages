export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxt/ui", "@vueuse/nuxt", "@nuxt/eslint", "@pinia/nuxt"],
  ui: {
    fonts: false,
  },
  css: ["~/assets/css/main.css"],
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
});
