import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{vue,ts}"],
  darkMode: "class",
  plugins: [typography],
};

export default config;
