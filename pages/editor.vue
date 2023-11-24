<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent } from "@tiptap/vue-3";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

const user = useUserStore();

user.tryLogin();

const editor = ref<Editor>();

const createEditor = () => {
  if (!user.u?.name) return;
  const provider = new HocuspocusProvider({
    url: "wss://fisschl.world/hocuspocus",
    name: "clpbx2uox00001bm1a3qbgg8y",
  });
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({
        document: provider.document,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: { name: user.u.name },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none outline-none",
      },
    },
  });
};

onMounted(() => {
  createEditor();
});
</script>

<template>
  <EditorContent :editor="editor" class="m-4 flex-1" :class="$style.editor" />
</template>

<style module>
.editor :global(.collaboration-cursor__caret) {
  border-right: 2px solid;
  pointer-events: none;
  position: relative;
}

.editor :global(.collaboration-cursor__label) {
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
