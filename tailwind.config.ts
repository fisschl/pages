import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import ratio from "@tailwindcss/aspect-ratio";

const config: Partial<Config> = {
  plugins: [typography, forms, ratio],
};

export default config;
