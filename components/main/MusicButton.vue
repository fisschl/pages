<script lang="ts">
import type { Howl } from "howler";

export interface Music {
  source: string;
}

export const music = ref<Music>();

const playing = ref(false);
const source = ref<string>();
const sound = ref<Howl>();

export const hide = async () => {
  const item = sound.value;
  if (!item) return;
  if (!item.playing()) return;
  item.fade(item.volume(), 0, 1000);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  item.stop();
};

export const play = async () => {
  if (!playing.value) return;
  if (!music.value) return;
  const { play } = await import("~/utils/music");
  sound.value = play(music.value.source);
  source.value = music.value.source;
};
</script>

<script setup lang="ts">
const changeMusicOpen = async () => {
  playing.value = !playing.value;
  if (!playing.value) return sound.value?.pause();
  if (!sound.value || source.value !== music.value?.source) return play();
  return sound.value.play();
};
</script>

<template>
  <UButton
    square
    variant="soft"
    icon="i-tabler-brand-netease-music"
    :class="{ 'animate-pulse': playing }"
    :color="playing ? 'violet' : 'primary'"
    @click="changeMusicOpen"
  />
</template>
