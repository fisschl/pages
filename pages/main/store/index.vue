<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import { join, basename } from "pathe";
import { ofetch } from "ofetch";

const user = useUserStore();
await user.checkLogin();

const prefix = `home/${user.user?.id}/store`;
const path = ref("/");

const { data, refresh } = await useFetch<any>("/api/oss/list", {
  query: computed(() => ({
    prefix: join(prefix, path.value),
  })),
});

const router = useRouter();

const handleUpload = async () => {
  await router.push({
    path: "/main/store/upload",
    query: {
      prefix,
      path: path.value,
    },
  });
};

const options = [
  [
    {
      label: "删除",
      icon: "i-tabler-trash",
      click: async (e: MouseEvent) => {
        if (!(e.target instanceof Element)) return;
        const li = e.target.closest(`[data-name]`);
        if (!(li instanceof HTMLElement)) return;
        const { name } = li.dataset;
        await ofetch("/api/oss/delete", {
          method: "DELETE",
          query: {
            key: name,
          },
          headers: {
            token: user.token || "",
          },
        });
        await refresh();
      },
    },
  ],
];
</script>

<template>
  <UContainer class="py-6">
    <div class="mb-4">
      <UButton icon="i-tabler-plus" @click="handleUpload"> 上传文件 </UButton>
    </div>
    <ul v-if="data" class="space-y-1">
      <li
        v-for="item in data.prefixes"
        :key="item"
        class="flex cursor-pointer items-center rounded bg-zinc-50 px-3 py-1 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        <UIcon
          name="i-tabler-folder"
          class="mr-2 text-yellow-500"
          style="font-size: 1.2rem"
        />
        <span class="flex-1 truncate">
          {{ basename(item) }}
        </span>
      </li>
      <li
        v-for="item in data.objects"
        :key="item.name"
        class="flex cursor-pointer items-center rounded bg-zinc-50 px-3 py-1 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        :data-name="item.name"
      >
        <UIcon
          name="i-tabler-file-filled"
          class="mr-2 text-blue-500"
          style="font-size: 1.2rem"
        />
        <span class="flex-1 truncate">
          {{ basename(item.name) }}
        </span>
        <UDropdown :items="options">
          <UButton
            color="gray"
            icon="i-tabler-dots-vertical"
            size="xs"
            variant="ghost"
          />
        </UDropdown>
      </li>
    </ul>
  </UContainer>
</template>

<style module></style>
