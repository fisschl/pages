<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import type { DropdownItem } from "#ui/types";

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
      label: "变量名转换",
      icon: "i-tabler-letter-case",
      to: "/main/case",
    },
    {
      label: "智能对话",
      icon: "i-tabler-brand-openai",
      to: "/chat",
    },
    {
      label: "翻译",
      icon: "i-tabler-language-hiragana",
      to: "/main/translate",
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
        const qs = new URLSearchParams({ from: location.href });
        const to = `/login?${qs}`;
        return navigateTo(to);
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
