import { Howl } from "howler";
import { reactive } from "vue";

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
    {
      label: "智能对话",
      icon: "i-tabler-brand-openai",
      to: "/chat",
    },
  ]);

  const visible = ref(false);

  const isMusicOpen = ref(false);
  const musics = reactive([
    {
      rule: "/",
      src: "https://cdn.fisschl.world/static/赴大荒.webm",
    },
  ]);
  const sound = shallowRef<Howl>();
  const route = useRoute();
  const newSound = async () => {
    const music = musics.find((item) => {
      return route.path.startsWith(item.rule);
    });
    if (!music) return;
    if (sound.value) {
      const item = sound.value;
      item.fade(item.volume(), 0, 1000);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      item.stop();
    }
    const item = new Howl({
      src: [music.src],
      loop: true,
      html5: true,
    });
    sound.value = item;
    return item;
  };
  const changeMusicOpen = async () => {
    isMusicOpen.value = !isMusicOpen.value;
    if (!sound.value) await newSound();
    if (isMusicOpen.value) sound.value?.play();
    else sound.value?.pause();
  };

  return {
    links,
    visible,
    changeMusicOpen,
    isMusicOpen,
  };
});
