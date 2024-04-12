<script setup lang="ts">
import { useUserStore } from "~/composables/user";

const visible = defineModel<boolean>("visible");

const links = computed(() => [
  {
    label: "主页",
    icon: "i-tabler-home",
    to: "/main/home",
  },
  {
    label: "代码格式化",
    icon: "i-tabler-indent-increase",
    to: "/main/format",
  },
  {
    label: "变量名转换",
    icon: "i-tabler-letter-case",
    to: "/main/case",
  },
  {
    label: "文件",
    icon: "i-tabler-photo",
    to: "/main/store",
  },
  {
    label: "代码仓库",
    icon: "i-tabler-brand-git",
    to: "https://gitea.bronya.world",
    target: "_blank",
  },
  {
    label: "智能对话",
    icon: "i-tabler-brand-openai",
    to: "/chat",
  },
]);

const login = computed(() => {
  const qs = new URLSearchParams({ from: location.href });
  return `/login?${qs}`;
});

const user = useUserStore();
</script>

<template>
  <USlideover v-model="visible" :ui="{ width: 'max-w-xs' }">
    <div class="flex flex-1 flex-col overflow-auto">
      <UButton
        :to="user.user ? '/main/user' : login"
        variant="ghost"
        color="gray"
        square
        class="mb-3 mt-4 self-center"
      >
        <UAvatar
          v-if="user.user?.avatar"
          size="lg"
          :src="`https://cdn.fisschl.world/${user.user.avatar}`"
        />
        <UAvatar v-else size="lg" icon="i-tabler-user" />
      </UButton>
      <UVerticalNavigation
        :links="links"
        class="mx-3 mb-3"
        @click="visible = false"
      />
    </div>
    <UButton
      class="absolute right-3 top-3"
      variant="ghost"
      color="gray"
      square
      icon="i-tabler-x"
      @click="visible = false"
    />
  </USlideover>
</template>
