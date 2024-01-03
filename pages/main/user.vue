<script setup lang="ts">
import { pick } from "lodash-es";

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
  if (!user.user) return;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: pick(user.user, ["profile"]),
  });
  user.user = res;
});

const handleChangeAvatar = () => {
  dialog.open();
};
</script>

<template>
  <div class="mx-4 py-4">
    <button title="更改头像" @click="handleChangeAvatar">
      <UAvatar v-if="user.user?.profile" size="lg" src="/api/profile" />
      <UAvatar v-else size="lg" icon="i-tabler-user" />
    </button>
  </div>
</template>
