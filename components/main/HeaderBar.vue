<script setup lang="ts">
import type { DropdownItem } from "#ui/types";
import { Howl } from "howler";
import { first, sample } from "lodash-es";

const navbar = defineModel<boolean>("navbar");

const sound = shallowRef<Howl>();

const musics = [
  {
    label: "赴大荒",
    src: "https://cdn.fisschl.world/static/赴大荒.webm",
  },
];

const currentMusic = ref(first(musics)!);

const stopMusic = () => {
  sound.value?.off().stop();
  sound.value = undefined;
};
onUnmounted(stopMusic);

const playMusic = (music?: (typeof musics)[number]) => {
  if (!music) music = sample(musics);
  currentMusic.value = music!;
  if (sound.value) stopMusic();
  sound.value = new Howl({
    src: [music!.src],
    html5: true,
    autoplay: true,
    onend: () => playMusic(),
    onloaderror: () => stopMusic(),
    onplayerror: () => stopMusic(),
  });
};

const musicOptions = computed(() => {
  const options = musics.map((music) => {
    const item: DropdownItem = {
      label: music.label,
      click: () => playMusic(music),
      icon: music.src === currentMusic.value.src ? "i-tabler-music" : undefined,
    };
    return item;
  });
  return [options];
});

const handleClickPlayMusic = () => {
  if (sound.value) stopMusic();
  else playMusic();
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
        :class="{ 'animate-pulse': sound }"
        :color="sound ? 'violet' : 'primary'"
        @click="handleClickPlayMusic"
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
