<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor, EditorContent } from "@tiptap/vue-3";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

const editor = ref<Editor>();

onMounted(() => {
  // Set up the Hocuspocus WebSocket provider
  const provider = new HocuspocusProvider({
    url: "wss://fisschl.world/hocuspocus",
    name: "example-document",
  });
  editor.value = new Editor({
    content: "<p>I’m running Tiptap with Vue.js. 🎉</p>",
    extensions: [
      StarterKit.configure({
        // The Collaboration extension comes with its own history handling
        history: false,
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: provider.document,
      }),
      // Register the collaboration cursor extension
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: "Cyndi Lauper",
        },
      }),
    ],
  });
});
</script>

<template>
  <div class="w-full flex-1">
    <EditorContent
      :editor="editor"
      class="prose mx-4 my-4 max-w-none dark:prose-invert"
    />
  </div>
</template>

<style module></style>
