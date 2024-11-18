<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { v7 as uuid } from "uuid";
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
  request.files = fileList.map(({ id }) => id);
  send(JSON.stringify(request));
  loading.value = true;
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

const request = reactive<TranslateRequest>({
  model: "moonshot-v1-8k",
  language: "zh",
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

const fileDialog = useFileDialog({
  multiple: true,
  accept: "image/*",
});

const isUploading = ref(false);
const toast = useToast();

interface FileInfo {
  id: string;
  src: string;
}
const fileList = reactive<FileInfo[]>([]);

const uploadFiles = async (files: FileList | null | undefined) => {
  if (!files) return;
  isUploading.value = true;
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { id } = await $fetch("/api/moonshot/file-upload", {
        method: "PUT",
        body: formData,
      });
      const src = URL.createObjectURL(file);
      fileList.push({ id, src });
    } catch (error) {
      console.error(error);
      toast.add({
        title: "解析失败",
        description: file.name,
        color: "red",
        icon: "i-tabler-alert-triangle",
      });
    }
  }
  isUploading.value = false;
  await startTranslate();
};

fileDialog.onChange(uploadFiles);

const clearContent = () => {
  editor.value?.commands.clearContent();
  fileList.splice(0);
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
        <div class="mb-2 space-x-3 space-y-3">
          <img
            v-for="item in fileList"
            :key="item.id"
            :src="item.src"
            alt="上传的图片"
          />
        </div>
      </article>
      <div class="mb-3 flex justify-end">
        <USelectMenu
          v-model="request.model"
          style="width: 11rem"
          :options="modelOptions"
          class="mr-3"
        />
        <USelectMenu
          v-model="request.language"
          style="width: 8rem"
          class="mr-3"
          :options="languageOptions"
          value-attribute="value"
        />
        <p class="flex-1" />
        <UButton
          square
          color="violet"
          title="清空内容"
          class="mr-3"
          icon="i-tabler-clear-all"
          @click="clearContent"
        />
        <UButton
          icon="i-tabler-photo-scan"
          square
          title="上传文件"
          :loading="isUploading"
          color="yellow"
          class="mr-3"
          @click="fileDialog.open"
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
