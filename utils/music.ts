import { Howl } from "howler";

export const play = (src: string) => {
  return new Howl({
    src: [src],
    loop: true,
    html5: true,
    autoplay: true,
  });
};
