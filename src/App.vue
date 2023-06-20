<script setup lang="ts">
import {
  ArcRotateCamera,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
  WebGPUEngine,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { useIntervalFn } from "@vueuse/core";
import { ref, onBeforeUnmount, onMounted } from "vue";

const createEngine = async () => {
  const canvas = document.getElementById("renderCanvas");
  if (!(canvas instanceof HTMLCanvasElement))
    throw new TypeError("Canvas not found");
  const gpuSupported = await WebGPUEngine.IsSupportedAsync;
  if (!gpuSupported) {
    console.log("WebGPU not supported, falling back to WebGL");
    return new Engine(canvas);
  }
  const engine = new WebGPUEngine(canvas);
  await engine.initAsync();
  window.addEventListener("resize", () => engine.resize());
  return engine;
};

const engine = ref<Engine>();
const fps = ref(0);

useIntervalFn(() => {
  if (!engine.value) return;
  fps.value = engine.value.getFps();
}, 100);

onBeforeUnmount(() => {
  engine.value?.dispose();
});

const msg = ref("");

onMounted(async () => {
  msg.value = "引擎初始化";
  engine.value = await createEngine();
  const scene = new Scene(engine.value);
  scene.clearColor = new Color4(0.1, 0.1, 0.1);

  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2,
    5,
    new Vector3(0, 1.5, 0),
    scene
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
    scene
  );

  const pipeline = new DefaultRenderingPipeline();
  pipeline.samples = 4;

  engine.value.runRenderLoop(() => scene.render());
  msg.value = "";
});
</script>

<template>
  <canvas id="renderCanvas" class="h-screen w-screen outline-none"></canvas>
  <section class="fixed top-0 flex w-full gap-2 px-2 py-1 text-sm">
    <span class="flex-1 text-center">{{ msg }}</span>
    <span>{{ fps.toFixed(0) }} FPS</span>
  </section>
</template>

<style scoped></style>
