import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  base: "gpu",
  plugins: [vue()],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
