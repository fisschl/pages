import prettier from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(prettier, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "vue/no-v-html": "off",
    "vue/no-multiple-template-root": "off",
  },
});
