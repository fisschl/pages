<script setup lang="ts">
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Paragraph from "@tiptap/extension-paragraph";
import { parseJSON } from "date-fns/esm";
import DOMPurify from "dompurify";

const editor = shallowRef<Editor>();
const text = ref("");
const form = ref<HTMLElement>();

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
    "Shift-Enter": () => {
      return editor.value!.commands.splitBlock();
    },
    "Mod-Enter": () => {
      return editor.value!.commands.splitBlock();
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

const isBreak = computed(() => {
  const p = form.value?.querySelector(`.tiptap p:nth-child(2)`);
  return text.value && p;
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
    <ol>
      <li v-for="item in list" :key="item.id" class="group px-4 py-1">
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
    <div class="sticky bottom-0 px-4 py-3">
      <form
        ref="form"
        class="overflow-hidden rounded-md border-2 border-gray-200 bg-zinc-100 pb-2 dark:border-gray-600 dark:bg-zinc-800"
        :class="$style.editBox"
      >
        <EditorContent
          :editor="editor"
          :class="[$style.editor, isBreak ? 'w-full' : '']"
          class="inline-block break-all px-3"
        />
        <UButton
          icon="i-tabler-send"
          class="float-right mx-2 mt-2 w-20 justify-center"
          @click="submit"
        />
      </form>
    </div>
  </div>
</template>

<style module>
.editBox .editor {
  min-width: calc(100% - 7rem);
  padding-top: 0.78rem;
}
</style>
