import { sxzz } from "@sxzz/eslint-config";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  sxzz([
    {
      rules: {
        "vue/component-name-in-template-casing": [
          "error",
          "PascalCase",
          { registeredComponentsOnly: false },
        ],
        "vue/multi-word-component-names": "off",
        "vue/no-multiple-template-root": "off",
      },
    },
  ]),
);
