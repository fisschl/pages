import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Partial<Config> = {
  plugins: [typography, forms],
};

export default config;
