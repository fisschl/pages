<script setup lang="ts">
import type { DropdownItem } from "#ui/types";
import { useMusicStore } from "~/composables/musics";

const navbar = defineModel<boolean>("navbar");
const music = useMusicStore();

const musicOptions = computed(() => {
  const options = music.musics.map((item, index) => {
    const option: DropdownItem = {
      label: item.label,
      click: () => music.play(index),
      icon: item.src === music.current?.src ? "i-tabler-music" : undefined,
    };
    return option;
  });
  return [options];
});

const handlePlay = () => {
  if (music.isPlaying) {
    music.sound?.stop();
    music.isPlaying = false;
    return;
  }
  if (music.sound) {
    music.sound.play();
    music.isPlaying = true;
    return;
  }
  music.planRandom();
};
</script>

<template>
  <header
    class="gap-4 bg-neutral-200/20 px-4 backdrop-blur dark:bg-neutral-700/20"
    :class="$style.header"
  >
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <UDropdown :items="musicOptions" mode="hover">
      <UButton
        square
        icon="i-tabler-brand-netease-music"
        style="border-radius: 50%"
        :class="{ 'animate-pulse': music.isPlaying }"
        :color="music.isPlaying ? 'violet' : 'primary'"
        @click="handlePlay"
      />
    </UDropdown>
    <UToggle
      v-model="navbar"
      on-icon="i-tabler-menu"
      off-icon="i-tabler-minimize"
    />
  </header>
</template>

<style module>
.header {
  height: var(--main-header-height);
  width: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
