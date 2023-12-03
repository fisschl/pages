<script setup lang="ts">
import type { NuxtLink } from "#build/components";
import type { JSONContent } from "@tiptap/vue-3";

const props = defineProps<{
  json: JSONContent;
}>();

const getText = (content: JSONContent): string | undefined => {
  if (content.type !== "text") {
    return content.content?.map((item) => getText(item)).join("");
  } else {
    return content.text;
  }
};

const list = computed(() => {
  return props.json.content
    ?.filter((item) => item.type === "heading")
    ?.map((item) => {
      return {
        level: item.attrs?.level,
        text: getText(item),
      };
    });
});
</script>

<template>
  <ol>
    <li v-for="(item, index) in list" :key="index" class="flex items-center">
      <NuxtLink> </NuxtLink>
    </li>
  </ol>
</template>

<style module></style>
