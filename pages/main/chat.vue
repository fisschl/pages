<script setup lang="ts">
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import HardBreak from "@tiptap/extension-hard-break";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Paragraph from "@tiptap/extension-paragraph";
import { parseJSON } from "date-fns/esm";

const editor = shallowRef<Editor>();
const text = ref("This is a radically reduced version of tiptap.");
const form = ref<HTMLElement>();

const submit = async () => {
  if (!text.value) return;
  await $fetch("/api/chat", {
    method: "POST",
    body: { message: text.value },
  });
};

const CustomDocument = Document.extend({
  addKeyboardShortcuts: () => ({
    Enter: () => {
      submit();
      return true;
    },
  }),
});

onMounted(() => {
  editor.value = new Editor({
    extensions: [CustomDocument, HardBreak, Paragraph, Text],
    content: text.value,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      text.value = editor.getHTML();
    },
  });
});

const isBreak = computed(() => {
  const br = form.value?.querySelector(`.tiptap br`);
  return text.value && br;
});

interface Message {
  id: string;
  message: string;
  time: string;
}

const list = ref<Message[]>([]);

const parseMessage = (item: any): Message => {
  const date = parseJSON(item.create_time);
  item.time = date.toLocaleString();
  item.message = item.message;
  return item;
};

const headers = useRequestHeaders(["cookie"]);

const load = async () => {
  const skip = list.value.length;
  const res = await $fetch("/api/chats", {
    headers,
    query: { skip },
  });
  const messages = res.map(parseMessage);
  list.value.push(...messages);
};

await load();

const sse = ref<EventSource>();
onMounted(() => {
  sse.value = new EventSource("/api/sse");
  sse.value.addEventListener("message", ({ data }) => {
    data = JSON.parse(data);
    list.value.push(parseMessage(data));
  });
});
onBeforeUnmount(() => {
  sse.value?.close();
});
</script>

<template>
  <div class="">
    <ol>
      <li v-for="item in list" :key="item.id">
        <span>
          {{ item.time }}
        </span>
        <article v-html="item.message"></article>
      </li>
    </ol>
    <form
      ref="form"
      class="m-4 overflow-hidden rounded-lg border-2 border-gray-500 pb-2"
      :class="$style.editBox"
    >
      <EditorContent
        :editor="editor"
        :class="[$style.editor, isBreak ? '!w-full' : undefined]"
        class="inline-block break-all px-3"
      />
      <UButton
        class="float-right mx-2 mt-2 w-20 justify-center"
        @click="submit"
      >
        发送
      </UButton>
    </form>
  </div>
</template>

<style module>
.editBox .editor {
  min-width: calc(100% - 7rem);
  padding-top: 0.78rem;
}
</style>
