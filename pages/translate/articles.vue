<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { v7 as uuid } from "uuid";
import { socket } from "~/composables/socket";

const articleElement = useTemplateRef<HTMLElement>("article-element");
const loading = ref(false);

const effects: (() => unknown)[] = [];
const clearEffects = () => {
  effects.forEach((fn) => fn());
  effects.length = 0;
};

const startTranslate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const key = uuid();
  const htmlText = editor.value?.getHTML();
  if (!htmlText) return;
  request.text = htmlText;
  loading.value = true;
  clearEffects();
  socket().emit("translation", {
    ...request,
    key,
  });
  const handler = async (response: Record<string, any>) => {
    const { text, finished } = response;
    if (finished) loading.value = false;
    const article = articleElement.value;
    if (!article || !text) return;
    const { update } = await import("~/utils/snabbdom");
    update(article, text);
  };
  socket().on(key, handler);
  effects.push(() => socket().off(key, handler));
};

const languageOptions = [
  {
    value: "zh",
    label: "简体中文",
  },
  {
    value: "en",
    label: "English",
  },
];

const request = reactive({
  text: "",
  language: "zh",
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.ctrlKey) return startTranslate();
};

const editor = shallowRef<Editor>();

onMounted(() => {
  editor.value = new Editor({
    autofocus: true,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert prose-code:text-sm",
      },
    },
  });
});

const handleClickEditor = ({ target }: MouseEvent) => {
  if (!(target instanceof Element)) return;
  const prose = target.closest(".prose");
  if (prose) return;
  editor.value?.commands.focus();
};

const clearContent = () => {
  editor.value?.commands.clearContent();
};

const handlePaste = async () => {
  await startTranslate();
};
</script>

<template>
  <main class="mt-4 flex gap-5 px-4 pb-6">
    <div class="min-w-0 flex-1">
      <article
        class="editor rounded-md border-gray-200 focus-within:border-blue-500 dark:border-gray-500 dark:focus-within:border-blue-500"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @click="handleClickEditor"
      >
        <EditorContent class="markdown" :editor="editor" />
      </article>
      <div class="mb-3 flex flex-wrap justify-end gap-3">
        <USelectMenu
          v-model="request.language"
          style="width: 8rem"
          :options="languageOptions"
          value-attribute="value"
        />
        <p class="flex-1" />
        <UButton
          square
          color="violet"
          title="清空内容"
          icon="i-tabler-clear-all"
          @click="clearContent"
        />
        <UButton icon="i-tabler-run" @click="startTranslate">
          开始翻译
        </UButton>
      </div>
    </div>
    <div class="markdown min-w-0 flex-1">
      <article
        ref="article-element"
        class="prose mb-2 dark:prose-invert prose-code:text-base"
      />
      <UIcon
        v-if="loading"
        name="i-tabler-loader-2"
        style="font-size: 20px"
        class="animate-spin"
      />
    </div>
  </main>
</template>

<style scoped>
.markdown :deep(.prose) {
  max-width: none;
}
.markdown :deep(.prose:focus) {
  outline: none;
}
.markdown :deep(code) {
  font-family: "Fira Code Variable", "Noto Sans SC Variable", monospace;
}

.editor {
  border-width: 2px;
  border-style: dashed;
  min-height: 20rem;
  margin-bottom: 0.8rem;
  padding: 0.6rem 0.8rem;
}
</style>
