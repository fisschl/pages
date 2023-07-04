<script setup lang="ts">
import { Application, Sprite, FederatedPointerEvent } from "pixi.js";

const container = ref<HTMLCanvasElement | null>(null);

/**
 * 使得 sprite 可以被拖动
 */
const useSpriteDrag = (sprite: Sprite, app: Application) => {
  app.stage.eventMode = "static";
  sprite.eventMode = "static";
  const startEvent = { x: 0, y: 0 };
  const startTarget = { x: 0, y: 0 };
  const onDragMove = (e: FederatedPointerEvent) => {
    sprite.x = startTarget.x + e.x - startEvent.x;
    sprite.y = startTarget.y + e.y - startEvent.y;
  };
  const onDragStart = (e: FederatedPointerEvent) => {
    startEvent.x = e.x;
    startEvent.y = e.y;
    startTarget.x = sprite.x;
    startTarget.y = sprite.y;
    app.stage.on("pointermove", onDragMove);
    app.stage.on("pointerup", onDragEnd);
    app.stage.on("pointerupoutside", onDragEnd);
  };
  const onDragEnd = () => {
    app.stage.off("pointermove", onDragMove);
    app.stage.off("pointerup", onDragEnd);
    app.stage.off("pointerupoutside", onDragEnd);
  };
  sprite.on("pointerdown", onDragStart);
};

const inputImg = async () => {
  // 选择图片
  const files = await new Promise<FileList | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files);
    input.click();
  });
  if (!files || !files.length) return;
  const file = files[0];
  // 将文件对象转换为 URL
  const url = await new Promise<string | void>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") return resolve();
      resolve(res);
    };
    reader.readAsDataURL(file);
  });
  if (!url) return;
  const imgSprite = Sprite.from(url);
  imgSprite.x = 0;
  imgSprite.y = 0;
  if (!container.value) return;
  const app = new Application({
    view: container.value,
    resizeTo: container.value,
  });
  app.stage.hitArea = app.screen;
  app.stage.addChild(imgSprite);
  useSpriteDrag(imgSprite, app);
};
</script>

<template>
  <main class="">
    <VBtn @click="inputImg"> 选择图片 </VBtn>
    <canvas class="main-canvas" ref="container"></canvas>
  </main>
</template>

<style scoped>
.main-canvas {
  width: 10rem;
  height: 10rem;
}
</style>
