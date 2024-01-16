<script setup lang="ts">
import { pick } from "lodash-es";
import { useUserStore } from "#imports";
import type { User } from "~/server/utils/schema";

const user = useUserStore();

await user.checkLogin();

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
  user.user = await $fetch<User>("/api/user", {
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
      <UAvatar v-if="user.avatar" size="lg" :src="user.avatar" />
      <UAvatar v-else size="lg" icon="i-tabler-user" />
    </button>
  </div>
</template>
