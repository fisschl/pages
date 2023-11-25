<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent } from "@tiptap/vue-3";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

const user = await useMustLogin();
const route = useRoute();
const id = route.query.id?.toString();
if (!id) await navigateTo("/main/article");
const headers = useRequestHeaders(["cookie"]);
const { data: article_token } = await useFetch("/api/article_token", {
  headers,
  query: { id },
});
const editor = ref<Editor>();

onMounted(() => {
  const username = user.u?.name;
  const token = article_token.value?.token;
  if (!username || !id || !token) return;
  const provider = new HocuspocusProvider({
    url: "wss://fisschl.world/hocuspocus",
    name: id,
    token,
  });
  const collaboration = Collaboration.configure({
    document: provider.document,
  });
  const collaborationCursor = CollaborationCursor.configure({
    provider: provider,
    user: { name: username },
  });
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({ history: false }),
      collaboration,
      collaborationCursor,
    ],
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none outline-none",
      },
    },
  });
});
</script>

<template>
  <EditorContent :editor="editor" class="m-4 flex-1" />
</template>

<style module></style>

<style>
.collaboration-cursor__caret {
  border-right: 2px solid;
  pointer-events: none;
  position: relative;
}

.collaboration-cursor__label {
  color: black;
  font-size: 14px;
  line-height: 18px;
  padding: 0 5px;
  position: absolute;
  left: 0;
  bottom: 100%;
  user-select: none;
}
</style>
