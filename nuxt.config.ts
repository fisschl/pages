export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/content",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@element-plus/nuxt",
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
          src: "https://gosspublic.alicdn.com/aliyun-oss-sdk-6.18.1.min.js",
          async: true,
        },
      ],
    },
  },
  elementPlus: {
    themes: ["dark"],
  },
});
