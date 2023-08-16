import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath, URL } from "node:url";
import vuetify from "vite-plugin-vuetify";
import tailwindcss from "tailwindcss";
import postcssPresetEnv from "postcss-preset-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: { defineModel: true },
    }),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "pinia"],
    }),
    vuetify(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [tailwindcss(), postcssPresetEnv()],
    },
  },
});
