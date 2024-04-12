import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/no-v-html": "off",
    "vue/no-multiple-template-root": "off",
    "vue/html-self-closing": "off",
  },
});
