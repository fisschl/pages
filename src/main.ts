/// <reference types="vite/client" />

import "@mdi/font/css/materialdesignicons.css";
import "@/assets/tailwind.css";
import "./assets/base.css";
import "vuetify/styles";

import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { zhHans } from "vuetify/locale";
import App from "./App.vue";
import router from "./routes";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
  },
  locale: {
    locale: "zhHans",
    messages: { zhHans },
  },
});
const pinia = createPinia();

createApp(App).use(router).use(pinia).use(vuetify).mount("#app");
