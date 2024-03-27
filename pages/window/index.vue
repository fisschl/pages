<script setup lang="ts">
import { isString } from "lodash-es";
import { useWindowStore } from "~/pages/window/window";

const route = useRoute();
const store = useWindowStore();

const { server } = route.query;
if (server && isString(server)) store.server = server;

const user = useUserStore();

onMounted(async () => {
  await $fetch("/api/window/push", {
    method: "POST",
    body: {
      key: server,
      value: {
        client: user.token,
      },
    },
  });
  const sse = new EventSource(`/api/sse?key=${user.token}`);
});
</script>

<template>
  <main></main>
</template>

<style module></style>
