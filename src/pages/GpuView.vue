<script setup lang="ts">
import {
  ArcRotateCamera,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  EngineFactory,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

const canvas = ref<HTMLCanvasElement>();

const engine = ref<Engine>();
useResizeObserver(canvas, () => engine.value?.resize());
onBeforeUnmount(() => {
  engine.value?.dispose();
  engine.value = undefined;
});

const msg = ref("");

onMounted(async () => {
  msg.value = "引擎初始化";
  if (!canvas.value) throw new TypeError("Canvas not found");
  engine.value = await EngineFactory.CreateAsync(canvas.value, {});
  const scene = new Scene(engine.value);
  scene.clearColor = new Color4(0.05, 0.05, 0.05);

  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    4,
    new Vector3(0, 1.5, 0),
    scene,
  );
  camera.lowerRadiusLimit = 1;
  camera.upperRadiusLimit = 100;
  camera.wheelDeltaPercentage = 5 / 1000;
  camera.attachControl();

  const light1 = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  light1.intensity = 2;
  msg.value = "模型加载";
  await SceneLoader.ImportMeshAsync(
    "",
    "//cdn.fisschl.world/3d/irena/",
    "scene.gltf",
    scene,
  );

  const pipeline = new DefaultRenderingPipeline();
  pipeline.samples = 4;

  engine.value.runRenderLoop(() => scene.render());
  msg.value = "";
});
</script>

<template>
  <canvas ref="canvas" class="h-screen w-screen outline-none"></canvas>
  <section class="fixed top-0 flex w-full gap-2 px-2 py-1 text-xs text-white">
    <span class="flex-1 text-center">{{ msg }}</span>
  </section>
</template>
