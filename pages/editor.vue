<script setup lang="ts">
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import Typography from "@tiptap/extension-typography";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Link from "@tiptap/extension-link";
import clsx from "clsx";
import { debounce } from "lodash-es";
import { useTitle } from "@vueuse/core";

const $style = useCssModule();

const route = useRoute();
const id = route.query.id?.toString();
if (!id) await navigateTo("/main/article");

const title = useTitle();
const loading = ref(true);
const body = ref("");

const editor = shallowRef<Editor>();

onMounted(async () => {
  const res = await $fetch("/api/article", {
    query: { id },
  });
  if (!res) return;
  title.value = res.name;
  body.value = res.body;
  editor.value = new Editor({
    content: body.value,
    editorProps: {
      attributes: {
        class: clsx("prose dark:prose-invert", $style.tiptap),
      },
    },
    extensions: [StarterKit, Highlight, Typography, Image, Link],
    onUpdate: debounce(async (opt) => {
      const html = opt.editor.getHTML();
      body.value = html;
      await $fetch("/api/article", {
        method: "PUT",
        body: { id, body: html },
      });
    }, 500),
  });
  loading.value = false;
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const updateArticleName = debounce(async () => {
  await $fetch("/api/article", {
    method: "PUT",
    body: { id, name: title.value },
  });
}, 500);

/**
 * 清除格式
 */
const clear = () => {
  editor.value?.chain().focus().unsetAllMarks().run();
  editor.value?.chain().focus().clearNodes().run();
};

const items = [
  [
    {
      label: "一级标题",
      icon: "i-tabler-h-1",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      label: "二级标题",
      icon: "i-tabler-h-2",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      label: "三级标题",
      icon: "i-tabler-h-3",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    {
      label: "四级标题",
      icon: "i-tabler-h-4",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 4 }).run();
      },
    },
    {
      label: "五级标题",
      icon: "i-tabler-h-5",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 5 }).run();
      },
    },
    {
      label: "六级标题",
      icon: "i-tabler-h-6",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 6 }).run();
      },
    },
  ],
];
</script>

<template>
  <div class="flex items-center px-1 pb-2 pt-5">
    <input
      v-model="title"
      class="flex-1 border-none bg-transparent text-xl !ring-0"
      @input="updateArticleName"
    />
  </div>
  <div v-if="editor" class="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
    <div class="flex flex-wrap items-center gap-2 px-4 py-2">
      <UButton
        v-if="editor.can().chain().focus().toggleBold().run()"
        size="xs"
        icon="i-tabler-bold"
        title="粗体"
        :color="editor.isActive('bold') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleItalic().run()"
        size="xs"
        icon="i-tabler-italic"
        title="斜体"
        :color="editor.isActive('italic') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleStrike().run()"
        size="xs"
        icon="i-tabler-strikethrough"
        title="删除线"
        :color="editor.isActive('strike') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleStrike().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleCode().run()"
        size="xs"
        icon="i-tabler-code"
        title="代码"
        :color="editor.isActive('code') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleCode().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleHighlight().run()"
        size="xs"
        icon="i-tabler-highlight"
        title="高亮"
        :color="editor.isActive('highlight') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleHighlight().run()"
      />
      <UButton size="xs" icon="i-tabler-eraser" color="white" @click="clear" />
      <UButton
        icon="i-tabler-letter-p"
        size="xs"
        title="段落"
        :color="editor.isActive('paragraph') ? 'black' : 'white'"
        @click="editor.chain().focus().setParagraph().run()"
      />
      <UDropdown :items="items" mode="hover">
        <UButton
          size="xs"
          icon="i-tabler-heading"
          title="标题"
          :color="editor.isActive('heading') ? 'black' : 'white'"
        />
      </UDropdown>
      <UButton
        size="xs"
        icon="i-tabler-list"
        title="列表"
        :color="editor.isActive('bulletList') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-list-numbers"
        title="有序列表"
        :color="editor.isActive('orderedList') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-source-code"
        title="代码块"
        :color="editor.isActive('codeBlock') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-blockquote"
        title="引用"
        :color="editor.isActive('blockquote') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-spacing-vertical"
        color="white"
        title="分割线"
        @click="editor.chain().focus().setHorizontalRule().run()"
      />
      <UButton
        size="xs"
        color="white"
        title="强制换行"
        icon="i-tabler-corner-down-left-double"
        @click="editor.chain().focus().setHardBreak().run()"
      />
    </div>
  </div>
  <EditorContent :editor="editor" class="mx-4 mt-4" />
  <p class="cursor-text pb-36" @click="editor?.commands.focus('end')"></p>
  <div v-if="loading" :class="$style.loader" class="backdrop-blur-lg">
    <UIcon name="i-tabler-loader" class="animate-spin text-2xl" />
  </div>
</template>

<style module>
.tiptap {
  max-width: none;
  outline: none;
}
.tiptap > * p {
  margin: 0;
}

.loader {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
</style>
