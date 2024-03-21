import { Howl } from "howler";

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

  const isMusicOpen = ref(false);
  const musics = reactive({
    ["赴大荒"]: "https://cdn.fisschl.world/static/赴大荒.webm",
  });
  const sound = shallowRef<Howl>();
  const changeMusicOpen = () => {
    isMusicOpen.value = !isMusicOpen.value;
    if (isMusicOpen.value) sound.value?.play();
    else sound.value?.pause();
  };
  const changeMusic = (name: keyof typeof musics) => {
    const item = musics[name];
    sound.value = new Howl({
      src: [item],
      html5: true,
      autoplay: false,
      loop: true,
    });
    if (isMusicOpen.value) sound.value.play();
  };

  return {
    links,
    visible,
    changeMusic,
    changeMusicOpen,
    isMusicOpen
  };
});
