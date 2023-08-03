import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}",
    "./node_modules/@milkdown/theme-nord/**/*.ts",
  ],
  darkMode: "class",
  plugins: [typography],
};

export default config;
