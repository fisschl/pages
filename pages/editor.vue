<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent } from "@tiptap/vue-3";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { IndexeddbPersistence } from "y-indexeddb";
import { Doc } from "yjs";
import { debounce, pick } from "lodash-es";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

const user = await useMustLogin();
const route = useRoute();
const id = route.query.id?.toString();
if (!id) await navigateTo("/main/article");
const headers = useRequestHeaders(["cookie"]);
const { data: token } = await useFetch("/api/article_token", {
  headers,
  query: { id },
});

const { data: article } = await useFetch("/api/article", {
  headers,
  query: { id },
  default: () => ({
    name: "异常",
  }),
});

const ydoc = new Doc();

const editor = shallowRef<Editor>();
const hocuspocus = shallowRef<HocuspocusProvider>();

onMounted(() => {
  const username = user.u?.name;
  if (!username || !id || !token.value?.token) return;
  new IndexeddbPersistence(id, ydoc);
  hocuspocus.value = new HocuspocusProvider({
    url: "wss://fisschl.world/hocuspocus",
    name: id,
    token: token.value.token,
    preserveConnection: false,
    document: ydoc,
  });
  const collaboration = Collaboration.configure({
    document: hocuspocus.value.document,
  });
  const collaborationCursor = CollaborationCursor.configure({
    provider: hocuspocus.value,
    user: { name: username },
  });
  editor.value = new Editor({
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none outline-none",
      },
    },
    extensions: [
      StarterKit.configure({ history: false }),
      collaboration,
      collaborationCursor,
      CharacterCount,
      Placeholder.configure({
        placeholder: "法律不容藐视，它自会证明它的价值。",
      }),
    ],
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
  hocuspocus.value?.destroy();
});

const updateArticleName = debounce(async () => {
  await $fetch("/api/article", {
    method: "PUT",
    body: pick(article.value, ["name", "id"]),
  });
}, 500);
</script>

<template>
  <div class="flex items-center px-4 pb-3 pt-5">
    <input
      v-model="article.name"
      class="flex-1 bg-transparent text-2xl outline-none"
      @input="updateArticleName"
    />
  </div>
  <div
    v-if="editor"
    class="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-zinc-50 px-4 py-2 dark:bg-zinc-900"
  >
    <UButton
      size="xs"
      :disabled="!editor.can().chain().focus().toggleBold().run()"
      :color="editor.isActive('bold') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleBold().run()"
    >
      bold
    </UButton>
    <UButton
      size="xs"
      :disabled="!editor.can().chain().focus().toggleItalic().run()"
      :color="editor.isActive('italic') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      italic
    </UButton>
    <UButton
      size="xs"
      :disabled="!editor.can().chain().focus().toggleStrike().run()"
      :color="editor.isActive('strike') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleStrike().run()"
    >
      strike
    </UButton>
    <UButton
      size="xs"
      :disabled="!editor.can().chain().focus().toggleCode().run()"
      :color="editor.isActive('code') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleCode().run()"
    >
      code
    </UButton>
    <UButton
      size="xs"
      color="white"
      @click="editor.chain().focus().unsetAllMarks().run()"
    >
      clear marks
    </UButton>
    <UButton
      size="xs"
      color="white"
      @click="editor.chain().focus().clearNodes().run()"
    >
      clear nodes
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('paragraph') ? 'black' : 'white'"
      @click="editor.chain().focus().setParagraph().run()"
    >
      paragraph
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 1 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      h1
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 2 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      h2
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 3 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      h3
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 4 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
    >
      h4
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 5 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
    >
      h5
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('heading', { level: 6 }) ? 'black' : 'white'"
      @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
    >
      h6
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('bulletList') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      bullet list
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('orderedList') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      ordered list
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('codeBlock') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleCodeBlock().run()"
    >
      code block
    </UButton>
    <UButton
      size="xs"
      :color="editor.isActive('blockquote') ? 'black' : 'white'"
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      blockquote
    </UButton>
    <UButton
      size="xs"
      color="white"
      @click="editor.chain().focus().setHorizontalRule().run()"
    >
      horizontal rule
    </UButton>
    <UButton
      size="xs"
      color="white"
      @click="editor.chain().focus().setHardBreak().run()"
    >
      hard break
    </UButton>
    <UButton
      size="xs"
      color="white"
      :disabled="!editor.can().chain().focus().undo().run()"
      @click="editor.chain().focus().undo().run()"
    >
      undo
    </UButton>
    <UButton
      size="xs"
      color="white"
      :disabled="!editor.can().chain().focus().redo().run()"
      @click="editor.chain().focus().redo().run()"
    >
      redo
    </UButton>
  </div>
  <EditorContent :editor="editor" class="mx-4 mb-10 mt-3 flex-1" />
</template>

<style module></style>

<style>
.tiptap .collaboration-cursor__caret {
  border-right: 2px solid;
  pointer-events: none;
  position: relative;
}

.tiptap .collaboration-cursor__label {
  color: black;
  font-size: 14px;
  line-height: 18px;
  padding: 0 5px;
  position: absolute;
  left: 0;
  bottom: 100%;
  user-select: none;
}

.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd8a;
  pointer-events: none;
}
</style>
