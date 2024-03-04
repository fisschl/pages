import { Howl } from "howler";
import { first, random } from "lodash-es";

export const useMusicStore = defineStore("pages-music", () => {
  const musics = reactive([
    {
      label: "赴大荒",
      src: "https://cdn.fisschl.world/static/赴大荒.webm",
    },
  ]);
  const isPlaying = ref(false);
  const sound = shallowRef<Howl>();
  const current = ref(first(musics));

  const play = (index: number) => {
    const item = musics[index];
    sound.value?.stop();
    sound.value = new Howl({
      src: [item.src],
      html5: true,
      autoplay: true,
      onend: () => planRandom(),
    });
    isPlaying.value = true;
  };

  const planRandom = () => {
    const index = random(musics.length - 1);
    play(index);
  };

  return {
    musics,
    sound,
    current,
    play,
    isPlaying,
    planRandom,
  };
});
