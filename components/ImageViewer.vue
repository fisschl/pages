<script setup lang="ts">
import { create, zoom } from "d3";

const props = defineProps<{
  src?: string | null;
}>();

const container = useTemplateRef<HTMLElement>("image-container");
const isViewerVisible = ref(false);

const openImageViewer = async (url: string) => {
  isViewerVisible.value = true;
  const image = new Image();
  await new Promise((resolve) => {
    image.addEventListener("load", resolve);
    image.src = url;
  });
  await nextTick();
  const svg = create("svg").style("width", "100%").style("height", "100%");
  container.value!.append(svg.node()!);
  const g = svg.append("g");
  const zoomBehavior = zoom<any, any>()
    .scaleExtent([0.5, 2])
    .on("zoom", ({ transform }) => {
      g.attr("transform", transform);
    });
  svg.call(zoomBehavior);
  const { width, height } = container.value!.getBoundingClientRect();
  const { naturalWidth, naturalHeight } = image;
  const scale = Math.min(width / naturalWidth, height / naturalHeight) * 0.9;
  const left = (width - naturalWidth * scale) / 2;
  const top = (height - naturalHeight * scale) / 2;
  g.append("image")
    .attr("href", url)
    .attr("width", naturalWidth * scale)
    .attr("height", naturalHeight * scale)
    .attr("x", left)
    .attr("y", top);
};

whenever(toRef(props, "src"), (src) => {
  openImageViewer(src);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isViewerVisible"
      class="image-viewer-container bg-gray-500/40 backdrop-blur-lg"
    >
      <article ref="image-container" class="absolute h-full w-full"></article>
    </div>
  </Teleport>
</template>

<style scoped>
.image-viewer-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
