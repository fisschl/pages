import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import ratio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";

const config: Partial<Config> = {
  plugins: [typography, ratio, forms],
};

export default config;
