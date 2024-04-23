<script setup lang="ts">
import { Application, BitmapText, Graphics } from "pixi.js";

const mainContainer = ref<HTMLElement>();

class Connection extends Graphics {
  distance = 60;
  arrowDX = 10;
  arrowDY = 6;
  connect(x1: number, y1: number, x2: number, y2: number) {
    this.position.x = x1;
    this.position.y = y1;
    const x = x2 - x1;
    const y = y2 - y1;
    return this.clear()
      .bezierCurveTo(this.distance, 0, x - this.distance, y, x, y)
      .lineTo(x - this.arrowDX, y + this.arrowDY)
      .moveTo(x, y)
      .lineTo(x - this.arrowDX, y - this.arrowDY);
  }
}

onMounted(async () => {
  const app = new Application();
  await app.init({
    hello: true,
    resizeTo: mainContainer.value,
    autoDensity: true,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio,
    antialias: true,
  });
  mainContainer.value?.appendChild(app.canvas);

  const conn = new Connection();
  conn.connect(30, 30, 180, 180).stroke({ width: 1, color: 0xffffff });

  app.stage.addChild(conn);

  const text = new BitmapText({
    text: "你好，世界",
    style: {
      fill: 0xffffff,
      fontSize: 16,
    },
  });
  text.position.set(100, 100);
  app.stage.addChild(text);
});
</script>

<template>
  <main ref="mainContainer" class="h-dvh w-screen overflow-hidden" />
</template>
