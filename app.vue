<script setup lang="ts">
const store = useUserStore();
const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/user", { headers });
store.u = data.value || undefined;
</script>

<template>
  <Html :class="$style.root">
    <Head>
      <Title> My Site </Title>
      <Link rel="preconnect" href="https://cdn.fisschl.world" />
      <Link rel="stylesheet" href="https://cdn.fisschl.world/MiSans/font.css" />
    </Head>
    <Body>
      <NuxtPage />
      <UNotifications />
    </Body>
  </Html>
</template>

<style module>
.root {
  --header-height: 3.5rem;
}
</style>
