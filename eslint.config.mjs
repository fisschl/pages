import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-plugin-prettier/recommended";

export default withNuxt(prettier, {
  rules: {
    "vue/no-v-html": "off",
    "vue/no-multiple-template-root": "off",
  },
});
