import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import ratio from "@tailwindcss/aspect-ratio";

const config: Partial<Config> = {
  plugins: [typography, ratio],
};

export default config;
