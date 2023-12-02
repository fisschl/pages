<script setup lang="ts">
const links = reactive([
  {
    label: "工具",
    children: [
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
        label: "文章",
        icon: "i-tabler-article",
        to: "/main/article",
      },
    ],
  },
  {
    label: "页面",
    children: [
      {
        label: "AI",
        icon: "i-tabler-brand-openai",
        to: "https://gpt.fisschl.world",
        target: "_blank",
      },
      {
        label: "博客",
        icon: "i-tabler-brand-blogger",
        to: "https://memos.fisschl.world",
        target: "_blank",
      },
      {
        label: "共享文件",
        icon: "i-tabler-device-floppy",
        to: "https://store.fisschl.world",
        target: "_blank",
      },
      {
        label: "代码仓库",
        icon: "i-tabler-brand-git",
        to: "https://git.fisschl.world",
        target: "_blank",
      },
    ],
  },
]);
</script>

<template>
  <nav class="flex-shrink-0 overflow-y-auto px-3 py-4">
    <template v-for="group in links" :key="group.label">
      <b class="mx-1 mb-2 mt-3 block text-sm">
        {{ group.label }}
      </b>
      <UVerticalNavigation :links="group.children" />
    </template>
  </nav>
</template>

<style module></style>
