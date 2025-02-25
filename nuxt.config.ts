import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
  ],
  ui: {
    fonts: false,
  },
  css: ["./assets/tailwind.css"],
  compatibilityDate: "2025-01-02",
  vite: {
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(browserslist()),
      },
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
});
