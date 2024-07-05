<script setup lang="ts">
import type { CSSProperties } from "vue";

const props = defineProps<{
  outer?: HTMLElement;
  selection?: string;
}>();

const image = ref<HTMLImageElement>();

const position = reactive({
  scale: 1,
  left: 0,
  top: 0,
  width: 2,
  height: 2,
});

const src = ref<string>();

onClickOutside(image, () => {
  src.value = undefined;
});

const setImage = async (element?: Element) => {
  if (!(element instanceof HTMLImageElement)) return;
  if (src.value === element.src) return;
  src.value = element.src;
  const { naturalWidth, naturalHeight } = element;
  await nextTick();
  if (!container.value) return;
  const { width, height } = container.value.getBoundingClientRect();
  const scale = Math.min(width / naturalWidth, height / naturalHeight) * 0.9;
  position.left = (width - naturalWidth * scale) / 2;
  position.top = (height - naturalHeight * scale) / 2;
  position.width = naturalWidth * scale;
  position.height = naturalHeight * scale;
  position.scale = 1;
  const style: CSSProperties = {
    width: position.width + "px",
    height: position.height + "px",
    left: position.left + "px",
    top: position.top + "px",
  };
  if (!image.value) return;
  Object.assign(image.value.style, style);
};

const container = ref<HTMLElement>();

const listenerTarget = computed(() => {
  if (typeof window === "undefined") return;
  return props.outer || document.body;
});

useEventListener(listenerTarget, "click", ({ target }) => {
  if (!(target instanceof Element)) return;
  if (props.selection) {
    const element = target.closest(props.selection);
    if (element) setImage(element);
    else return;
  } else {
    if (target instanceof HTMLImageElement) setImage(target);
    else return;
  }
});

const handleMouseDown = (e: MouseEvent) => {
  const { clientX, clientY } = e;
  const { left, top } = position;
  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - clientX;
    const dy = e.clientY - clientY;
    position.left = left + dx;
    position.top = top + dy;
    const style: CSSProperties = {
      left: position.left + "px",
      top: position.top + "px",
    };
    Object.assign(image.value!.style, style);
  };
  document.addEventListener("mousemove", handleMouseMove);
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseWheel = (e: WheelEvent) => {
  e.preventDefault();
  const { deltaY } = e;
  const d = -deltaY / 5000;
  if (d < 0 && position.scale < 0.25) return;
  if (d > 0 && position.scale > 4) return;
  position.scale += d;
  const style: CSSProperties = {
    transform: `scale(${position.scale})`,
  };
  Object.assign(image.value!.style, style);
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="src"
      class="fixed top-0 z-10 flex h-full w-full flex-col overflow-hidden backdrop-blur-md"
    >
      <section ref="container" class="relative flex-1 overflow-hidden">
        <img
          ref="image"
          :src="src"
          draggable="false"
          alt="预览图片"
          class="absolute origin-center"
          @mousedown="handleMouseDown"
          @wheel="handleMouseWheel"
        />
      </section>
    </div>
  </teleport>
</template>

<style module></style>
