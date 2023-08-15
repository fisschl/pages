<script setup lang="ts">
import { useTheme } from "vuetify";

const isDark = useDark();
const theme = useTheme();
watchEffect(() => {
  theme.global.name.value = isDark.value ? "dark" : "light";
});
</script>

<template>
  <RouterView />
</template>

<style>
body {
  font-family: "HarmonyOS Sans", ui-sans-serif, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
</style>
