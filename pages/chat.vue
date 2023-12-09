<script setup lang="ts">
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Paragraph from "@tiptap/extension-paragraph";
import { parseJSON } from "date-fns/esm";
import { debounce } from "lodash-es";
import DOMPurify from "dompurify";

const editor = shallowRef<Editor>();
const text = ref("");

const submit = async () => {
  if (!text.value) return;
  await $fetch("/api/chat", {
    method: "POST",
    body: { message: text.value },
  });
  editor.value?.commands.clearContent();
  text.value = "";
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
    extensions: [CustomDocument, Paragraph, Text],
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

interface Message {
  id: string;
  message: string;
  time: string;
}

const list = ref<Message[]>([]);

const parseMessage = (item: any): Message => {
  const date = parseJSON(item.create_time);
  item.time = date.toLocaleString();
  item.message = DOMPurify.sanitize(item.message);
  return item;
};

const load = async () => {
  const skip = list.value.length;
  const res = await $fetch("/api/chats", {
    query: { skip },
  });
  const messages = res.map(parseMessage);
  list.value = [...messages.reverse(), ...list.value];
};

const container = ref<HTMLElement>();
const { y } = useScroll(container);

whenever(
  () => y.value < 20,
  debounce(async () => {
    if (!list.value.length) return;
    await load();
  }, 100),
);

onMounted(async () => {
  await load();
  await nextTick();
  y.value = container.value?.scrollHeight || 0;
});

const sse = ref<EventSource>();
onMounted(() => {
  sse.value = new EventSource("/api/sse");
  sse.value.addEventListener("message", async ({ data }) => {
    data = JSON.parse(data);
    list.value.push(parseMessage(data));
    const ele = container.value;
    if (!ele) return;
    const scrollBottom = ele.scrollHeight - y.value - ele.clientHeight;
    const shouldScroll = scrollBottom < 10;
    await nextTick();
    if (shouldScroll) y.value = ele.scrollHeight;
  });
});
onBeforeUnmount(() => {
  sse.value?.close();
});
</script>

<template>
  <div ref="container" class="h-screen overflow-auto">
    <ol class="mb-3 flex flex-col">
      <li
        v-for="item in list"
        :key="item.id"
        class="group self-start px-3 py-2"
        :data-key="item.id"
      >
        <p
          class="px-3 py-1 text-xs text-transparent group-hover:text-gray-300 dark:group-hover:text-gray-500"
        >
          {{ item.time }}
        </p>
        <article
          class="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
          v-html="item.message"
        ></article>
      </li>
    </ol>
    <EditorContent
      class="sticky bottom-0 cursor-text bg-zinc-100 px-4 py-3 dark:bg-zinc-800"
      :editor="editor"
      :class="$style.editor"
      @click="editor?.commands.focus()"
    />
  </div>
</template>

<style module>
.editor {
  min-height: 3rem;
}
</style>
