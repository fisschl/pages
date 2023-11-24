<script setup lang="ts">
import { pick } from "lodash-es";

await useMustLogin();

const { data } = useFetch("/api/articles");

const links = computed(() => {
  return data.value?.map((item) => {
    const qs = new URLSearchParams(pick(item, "id"));
    return {
      label: item.name,
      to: `/editor?${qs}`,
    };
  });
});

const handleCreate = async () => {
  const item = await $fetch("/api/article", {
    method: "POST",
    body: { name: "新文章" },
  });
  await navigateTo({
    path: `/editor`,
    query: pick(item, "id"),
  });
};
</script>

<template>
  <div class="m-4">
    <UButton @click="handleCreate"> 新建 </UButton>
  </div>
  <UVerticalNavigation :links="links" />
</template>

<style module></style>
