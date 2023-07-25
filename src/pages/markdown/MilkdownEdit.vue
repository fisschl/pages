<script setup lang="ts">
import { Editor, rootCtx } from "@milkdown/core";
import { clipboard } from "@milkdown/plugin-clipboard";
import { cursor } from "@milkdown/plugin-cursor";
import { emoji } from "@milkdown/plugin-emoji";
import { history } from "@milkdown/plugin-history";
import { indent } from "@milkdown/plugin-indent";
import { prism } from "@milkdown/plugin-prism";
import { trailing } from "@milkdown/plugin-trailing";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { nord } from "@milkdown/theme-nord";
import "@milkdown/theme-nord/style.css";
import { Milkdown, useEditor } from "@milkdown/vue";
import "prism-themes/themes/prism-nord.css";
import "katex/dist/katex.min.css";
import { defaultValueCtx } from "@milkdown/core";
import { math } from "@milkdown/plugin-math";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { debounce } from "lodash-es";
import { editorViewOptionsCtx } from "@milkdown/core";
import { replaceAll } from "@milkdown/utils";

const props = defineProps<{
  content: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:content": [string];
}>();

const content = useVModel(props, "content", emit);

const editor = useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      if (content.value) ctx.set(defaultValueCtx, content.value);
      ctx.get(listenerCtx).markdownUpdated(
        debounce((_ctx, markdown) => {
          content.value = markdown;
        }, 500),
      );
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        editable: () => !props.readonly,
      }));
    })
    .config(nord)
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

const reset = async () => {
  await nextTick();
  editor.get()?.action(replaceAll(content.value));
};

defineExpose({ reset });
</script>

<template>
  <Milkdown />
</template>
