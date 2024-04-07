import "dotenv/config";

export default defineNuxtConfig({
  modules: [
    process.env.NODE_ENV === "development" ? "@nuxt/devtools" : false,
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@element-plus/nuxt",
    process.env.NODE_ENV === "development" ? "@nuxt/eslint" : false,
  ],

  ui: {
    icons: ["tabler"],
  },

  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.fisschl.world/static/MiSans/font.css",
        },
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
          async: true,
        },
      ],
    },
  },

  elementPlus: {
    themes: ["dark"],
  },

  routeRules: {
    "/": { redirect: "/main/home" },
    "/graph/**": { ssr: false },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },
});
