/// <reference types="vite/client" />

import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";
import "./assets/base.css";
import router from "./routes";
import store from "./store";

createApp(App).use(router).use(store).mount("#app");
