/// <reference types="vite/client" />

import "@/assets/tailwind.css";
import "vuetify/styles";

import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { zhHans } from "vuetify/locale";
import App from "./App.vue";
import router from "./routes";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
  },
  locale: {
    locale: "zhHans",
    messages: { zhHans },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});

createApp(App).use(router).use(createPinia()).use(vuetify).mount("#app");
