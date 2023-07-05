/// <reference types="vite/client" />

import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { zhHans } from "vuetify/locale";
import "vuetify/styles";
import App from "./App.vue";
import "./assets/base.css";
import "./assets/tailwind.css";
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
