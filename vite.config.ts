import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/pages/",
  plugins: [vue()],
  build: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
