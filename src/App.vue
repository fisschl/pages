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
