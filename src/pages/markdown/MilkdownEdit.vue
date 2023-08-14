<script setup lang="ts">
import "prism-themes/themes/prism-nord.css";
import "katex/dist/katex.min.css";
import "prosemirror-view/style/prosemirror.css";

import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  rootCtx,
} from "@milkdown/core";
import { clipboard } from "@milkdown/plugin-clipboard";
import { cursor } from "@milkdown/plugin-cursor";
import { emoji } from "@milkdown/plugin-emoji";
import { history } from "@milkdown/plugin-history";
import { indent } from "@milkdown/plugin-indent";
import { prism } from "@milkdown/plugin-prism";
import { trailing } from "@milkdown/plugin-trailing";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Milkdown, useEditor } from "@milkdown/vue";
import { math } from "@milkdown/plugin-math";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { debounce } from "lodash-es";
import { replaceAll } from "@milkdown/utils";

const props = defineProps<{
  modelValue: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [string];
}>();

const modelValue = useVModel(props, "modelValue", emit);
const content = ref(props.modelValue);

watch(modelValue, async (value) => {
  await nextTick();
  if (value === content.value) return;
  content.value = value;
  editor.get()?.action(replaceAll(value));
});

const editor = useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      if (content.value) ctx.set(defaultValueCtx, content.value);
      ctx.get(listenerCtx).markdownUpdated(
        debounce((_ctx, markdown) => {
          content.value = markdown;
          modelValue.value = content.value;
        }, 500),
      );
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: {
          class: "prose dark:prose-invert max-w-none outline-none",
        },
        editable: () => !props.readonly,
      }));
    })
    .use(commonmark)
    .use(history)
    .use(gfm)
    .use(emoji)
    .use(listener)
    .use(math)
    .use(clipboard)
    .use(cursor)
    .use(indent)
    .use(trailing)
    .use(prism);
});
</script>

<template>
  <Milkdown class="editor" />
</template>

<style scoped></style>
