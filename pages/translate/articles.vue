<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { v7 as uuid } from "uuid";
import ImageViewer from "~/components/ImageViewer.vue";
import type { TranslateRequest } from "~/server/api/translate";

const translateURL = computed(() => {
  if (typeof window === "undefined") return;
  const scheme = location.protocol.startsWith("https") ? "wss" : "ws";
  return `${scheme}://${location.host}/api/translate`;
});

const articleElement = useTemplateRef<HTMLElement>("article-element");
const loading = ref(false);

const { send } = useWebSocket(translateURL, {
  async onMessage(ws, { data }) {
    if (!data) return;
    const response = JSON.parse(data);
    const { key, text, finished } = response;
    if (key !== request.key) return;
    if (finished) loading.value = false;
    const article = articleElement.value;
    if (!article || !text) return;
    const { update } = await import("~/utils/snabbdom");
    update(article, text);
  },
  autoReconnect: true,
});

const startTranslate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
  request.key = uuid();
  request.text = editor.value?.getHTML();
  send(JSON.stringify(request));
  loading.value = true;
};

const request = reactive<TranslateRequest>({
  model: "moonshot-v1-8k",
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.ctrlKey) return startTranslate();
};

const modelOptions = ["moonshot-v1-8k", "qwen-max", "gpt-4o", "gpt-4o-mini"];

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
</script>

<template>
  <main class="mt-4 flex gap-5 px-4 pb-6">
    <div class="min-w-0 flex-1">
      <EditorContent
        class="markdown editor rounded-md border-gray-200 focus-within:border-blue-500 dark:border-gray-500 dark:focus-within:border-blue-500"
        :editor="editor"
        @keydown="handleKeyDown"
        @paste="startTranslate"
        @click="handleClickEditor"
      />
      <div class="flex justify-end">
        <USelectMenu
          v-model="request.model"
          style="width: 11rem"
          :options="modelOptions"
        />
        <p class="flex-1" />
        <UButton icon="i-tabler-topology-star" @click="startTranslate">
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
    <ImageViewer />
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
