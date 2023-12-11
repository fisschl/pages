<script setup lang="ts">
const store = useUserStore();
const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/user", { headers });
store.u = data.value || undefined;
</script>

<template>
  <Html lang="zh">
    <Head>
      <Title> My Site </Title>
      <Link rel="preconnect" href="https://cdn.fisschl.world" />
      <Link rel="stylesheet" href="https://cdn.fisschl.world/MiSans/font.css" />
    </Head>
    <Body :class="$style.root">
      <NuxtPage />
      <UNotifications />
    </Body>
  </Html>
</template>

<style module>
.root {
  --main-header-height: 3.5rem;
  --main-navbar-width: 12rem;
  display: flex;
  flex-direction: column;
}
</style>
