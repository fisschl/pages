<script setup lang="ts">
import type { DropdownItem } from "#ui/types";
import { useUserStore } from "~/composables/user";

const links = computed<DropdownItem[][]>(() => [
  [
    {
      label: "主页",
      icon: "i-tabler-home",
      to: "/main/home",
    },
  ],
  [
    {
      label: "智能对话",
      icon: "i-tabler-brand-openai",
      to: "/chat",
    },
  ],
  [
    {
      label: "代码仓库",
      icon: "i-tabler-brand-github",
      to: "https://github.com/fisschl/pages",
      target: "_blank",
    },
  ],
]);

const user = useUserStore();

const items = computed(() => {
  const login_list: DropdownItem[] = [];
  if (!user.info) {
    login_list.push({
      label: "登录",
      icon: "i-tabler-user-circle",
      click: () => {
        const query = new URLSearchParams({
          from: location.href,
        });
        location.href = `https://bronya.world/login?${query}`;
      },
    });
  } else {
    const { avatar_url, name } = user.info;
    login_list.push({
      label: name,
      icon: !avatar_url ? "i-tabler-user-circle" : undefined,
      avatar: avatar_url ? { src: avatar_url } : undefined,
      to: "https://gitee.com",
    });
  }
  return [login_list, ...links.value];
});
</script>

<template>
  <UDropdown :items="items">
    <UButton variant="soft" color="indigo" square icon="i-tabler-menu" />
  </UDropdown>
</template>
