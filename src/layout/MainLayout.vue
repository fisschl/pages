<script setup lang="ts">
import {
  IconHome,
  IconBoxSeam,
  IconCloudSearch,
  Icon3dCubeSphere,
  IconBrandOpenai,
  IconMarkdown,
} from "@tabler/icons-vue";

const drawer = ref(false);

const MenuList = [
  {
    title: "主页",
    icon: markRaw(IconHome),
    to: "/",
  },
  {
    title: "文件库",
    icon: markRaw(IconBoxSeam),
    href: "https://store.fisschl.world",
  },
  {
    title: "热搜分析",
    icon: markRaw(IconCloudSearch),
    to: "/main/top",
  },
  {
    title: "GPU",
    icon: markRaw(Icon3dCubeSphere),
    to: "/gpu",
  },
  {
    title: "GPT",
    icon: markRaw(IconBrandOpenai),
    href: "https://gpt.fisschl.world",
  },
  {
    title: "Markdown",
    icon: markRaw(IconMarkdown),
    to: "/markdown",
  },
];
</script>

<template>
  <VLayout>
    <VAppBar>
      <VAppBarNavIcon @click="drawer = !drawer" />
      <VToolbarTitle> 大道之行也 天下为公 </VToolbarTitle>
    </VAppBar>
    <VNavigationDrawer v-model="drawer" expand-on-hover :rail="true">
      <VList>
        <VListItem
          v-for="item in MenuList"
          :key="item.to || item.href"
          :to="item.to"
          :href="item.href"
          :title="item.title"
          :prepend-icon="item.icon"
        >
        </VListItem>
      </VList>
    </VNavigationDrawer>
    <VMain>
      <RouterView />
      <VFooter>
        <VBtn href="https://beian.miit.gov.cn/" variant="text" target="_blank">
          豫ICP备2023011860号-1
        </VBtn>
      </VFooter>
    </VMain>
  </VLayout>
</template>
