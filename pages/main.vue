<script setup lang="ts">
import { useNav } from "~/composables/nav";
import { useUserStore } from "@/composables/user";

const nav = useNav();
const { changeMusicOpen } = nav;

const handleClickLogin = () => {
  const qs = new URLSearchParams({ from: location.href });
  location.href = `/login?${qs}`;
};

const user = useUserStore();
</script>

<template>
  <header class="flex items-center gap-3 px-4 py-3">
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <UButton
      square
      variant="soft"
      icon="i-tabler-brand-netease-music"
      :class="{ 'animate-pulse': nav.isMusicOpen }"
      :color="nav.isMusicOpen ? 'violet' : 'primary'"
      @click="changeMusicOpen"
    />
    <UButton
      variant="soft"
      color="indigo"
      square
      icon="i-tabler-menu"
      @click="nav.visible = true"
    />
    <USlideover v-model="nav.visible">
      <div class="flex flex-1 flex-col overflow-auto">
        <UButton
          :to="user.user ? '/main/user' : undefined"
          variant="ghost"
          color="gray"
          square
          class="mb-3 mt-4 self-center"
          @click="user.user ? undefined : handleClickLogin"
        >
          <UAvatar v-if="user.avatar" size="lg" :src="user.avatar" />
          <UAvatar v-else size="lg" icon="i-tabler-user" />
        </UButton>
        <UVerticalNavigation
          :links="nav.links"
          class="mx-3 mb-3"
          @click="nav.visible = false"
        />
      </div>
      <UButton
        class="absolute right-3 top-3"
        variant="ghost"
        color="gray"
        square
        icon="i-tabler-x"
        @click="nav.visible = false"
      />
    </USlideover>
  </header>
  <main class="overflow-hidden">
    <NuxtPage />
  </main>
  <footer
    class="bg-zinc-50 py-10 text-center text-sm text-gray-500 dark:bg-zinc-900"
  >
    <a
      href="https://beian.miit.gov.cn/"
      target="_blank"
      class="hover:underline"
    >
      豫ICP备2023011860号-2
    </a>
  </footer>
</template>
