<script setup lang="ts">
import { useUserStore } from "#imports";
import { pick } from "lodash-es";

const store = useUserStore();

await store.checkLogin();

const dialog = useFileDialog({ accept: "image/*" });
dialog.onChange(async (files) => {
  if (!files?.length) return;
  const file = files[0];
  const { url } = await $fetch("/api/profile_upload", {
    query: pick(file, ["name", "type"]),
  });
  await $fetch(url, {
    method: "PUT",
    body: file,
  });
  store.user = await $fetch("/api/user", {
    method: "PUT",
    body: {
      profile: file.name,
    },
  });
});

const handleChangeAvatar = () => {
  dialog.open();
};
</script>

<template>
  <div class="mx-4 py-4">
    <button title="更改头像" @click="handleChangeAvatar">
      <UAvatar v-if="store.avatar" size="lg" :src="store.avatar" />
      <UAvatar v-else size="lg" icon="i-tabler-user" />
    </button>
  </div>
</template>
