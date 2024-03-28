<script setup lang="ts">
import { isString } from "lodash-es";
import { useWindowStore } from "~/pages/graph/window/window";

const route = useRoute();
const store = useWindowStore();

const { server } = route.query;
if (server && isString(server)) store.server = server;
else await navigateTo("/");

const { connect, disconnect, listen } = store;

await connect();
onUnmounted(disconnect);

listen((data) => {
  console.log(data);
});
</script>

<template>
  <main></main>
</template>

<style module></style>
