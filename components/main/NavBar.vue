<script setup lang="ts">
import { useUserStore } from "@/composables/user";

const links = computed(() => [
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
        label: "变量名转换",
        icon: "i-tabler-letter-case",
        to: "/main/case",
      },
      {
        label: "二维码生成",
        icon: "i-tabler-qrcode",
        to: "/main/qrcode",
      },
      {
        label: "图床",
        icon: "i-tabler-photo",
        to: "/main/pictures",
      },
    ],
  },
  {
    label: "页面",
    children: [
      {
        label: "代码仓库",
        icon: "i-tabler-brand-git",
        to: "https://gitea.bronya.world",
        target: "_blank",
      },
    ],
  },
]);

const handleClickLogin = () => {
  const qs = new URLSearchParams({ from: location.href });
  location.href = `/login?${qs}`;
};

const user = useUserStore();
</script>

<template>
  <nav
    class="flex-shrink-0 bg-zinc-100 px-3 pb-2 pt-4 backdrop-blur dark:bg-zinc-700/30"
    :class="$style.navContainer"
  >
    <div class="mb-3 flex-1">
      <template v-for="group in links" :key="group.label">
        <b class="mx-1 mb-2 mt-3 block text-sm">
          {{ group.label }}
        </b>
        <UVerticalNavigation :links="group.children" />
      </template>
    </div>
    <UButton v-if="user.user" to="/main/user" color="gray" variant="ghost">
      <template #leading>
        <UAvatar
          v-if="user.user.avatar"
          size="xs"
          :src="`https://cdn.fisschl.world/home/${user.user.id}/avatar/${user.user.avatar}`"
        />
        <UAvatar v-else size="xs" icon="i-tabler-user" />
      </template>
      <span class="ml-2">
        {{ user.user?.name }}
      </span>
    </UButton>
    <UButton v-else variant="ghost" color="gray" @click="handleClickLogin">
      <template #leading>
        <UAvatar icon="i-tabler-user" size="sm" />
      </template>
      <span class="ml-2"> 登录 </span>
    </UButton>
  </nav>
</template>

<style module>
.navContainer {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>
