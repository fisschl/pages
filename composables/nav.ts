import { Howl } from "howler";
import { first, random } from "lodash-es";

export const useNav = defineStore("pages-nav", () => {
  const links = computed(() => [
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
      label: "文件",
      icon: "i-tabler-photo",
      to: "/main/store",
    },
    {
      label: "代码仓库",
      icon: "i-tabler-brand-git",
      to: "https://gitea.bronya.world",
      target: "_blank",
    },
  ]);

  const visible = ref(false);

  const musics = reactive([
    {
      label: "赴大荒",
      src: "https://cdn.fisschl.world/static/赴大荒.webm",
    },
  ]);
  const isPlayingSound = ref(false);
  const sound = shallowRef<Howl>();
  const currentMusic = ref(first(musics));

  const playSound = (index: number) => {
    const item = musics[index];
    sound.value?.stop();
    sound.value = new Howl({
      src: [item.src],
      html5: true,
      autoplay: true,
      onend: () => planRandom(),
    });
    isPlayingSound.value = true;
  };

  const planRandom = () => {
    const index = random(musics.length - 1);
    playSound(index);
  };

  return {
    links,
    visible,
    musics,
    sound,
    currentMusic,
    playSound,
    isPlayingSound,
    planRandom,
  };
});
