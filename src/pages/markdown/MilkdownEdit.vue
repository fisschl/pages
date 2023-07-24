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

useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
    })
    .config(nord)
    .use(commonmark)
    .use(history)
    .use(gfm)
    .use(emoji)
    .use(clipboard)
    .use(cursor)
    .use(indent)
    .use(trailing)
    .use(prism);
});
</script>

<template>
  <Milkdown />
</template>
