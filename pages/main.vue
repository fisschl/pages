<script setup lang="ts">
import { useNav } from "~/composables/nav";
import { useUserStore } from "@/composables/user";

const nav = useNav();
const { changeMusicOpen } = nav;

const login = computed(() => {
  const qs = new URLSearchParams({ from: location.href });
  return `/login?${qs}`;
});

const user = useUserStore();
</script>

<template>
  <div>
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
      <USlideover v-model="nav.visible" :ui="{ width: 'max-w-xs' }">
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
    <main>
      <NuxtPage />
    </main>
    <footer class="py-10 text-center text-sm text-gray-500">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        class="hover:underline"
      >
        豫ICP备2023011860号-2
      </a>
    </footer>
  </div>
</template>

<style module>
.menu_width {
  width: 12rem;
}
</style>
