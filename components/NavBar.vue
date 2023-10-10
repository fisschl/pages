<script setup lang="ts">
const nav = useNav();
const handleLinkClick = () => {
  nav.value.isDrawerNavVisible = false;
};

const links = reactive([
  {
    label: "工具",
    children: [
      {
        label: "主页",
        icon: "i-tabler-home",
        to: "/",
        click: handleLinkClick,
      },
      {
        label: "Markdown",
        icon: "i-tabler-markdown",
        to: "/md",
        click: handleLinkClick,
      },
      {
        label: "代码格式化",
        icon: "i-tabler-indent-increase",
        to: "/format",
        click: handleLinkClick,
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
  <section>
    <template v-for="group in links" :key="group.label">
      <b class="mx-1 mb-2 mt-3 block text-sm">
        {{ group.label }}
      </b>
      <UVerticalNavigation :links="group.children" />
    </template>
  </section>
</template>

<style module></style>
