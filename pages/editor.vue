<script setup lang="ts">
import { HocuspocusProvider } from "@hocuspocus/provider";
import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Typography from "@tiptap/extension-typography";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Link from "@tiptap/extension-link";
import { debounce, pick } from "lodash-es";
import { IndexeddbPersistence } from "y-indexeddb";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { Doc } from "yjs";

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
  if (!username || !id || !token.value) return;
  new IndexeddbPersistence(id, ydoc);
  hocuspocus.value = new HocuspocusProvider({
    url: "wss://fisschl.world/hocuspocus",
    name: id,
    token: token.value,
    preserveConnection: false,
    document: ydoc,
    onAuthenticationFailed: () => {
      alert("连接失败，请刷新页面重试");
    },
  });
  editor.value = new Editor({
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none outline-none",
      },
    },
    extensions: [
      Collaboration.configure({
        document: hocuspocus.value.document,
      }),
      CollaborationCursor.configure({
        provider: hocuspocus.value,
        user: { name: username },
      }),
      Placeholder.configure({
        placeholder: "法律不容藐视，它自会证明它的价值。",
      }),
      Highlight,
      Typography,
      Document,
      Paragraph,
      HorizontalRule,
      Heading,
      Strike,
      Code,
      Text,
      Image,
      Gapcursor,
      Dropcursor,
      Bold,
      Italic,
      OrderedList,
      Link,
      HardBreak,
      Blockquote,
      CodeBlock,
      BulletList,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      ListItem,
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

/**
 * 清除格式
 */
const clear = () => {
  editor.value?.chain().focus().unsetAllMarks().run();
  editor.value?.chain().focus().clearNodes().run();
};

const items = [
  [
    {
      label: "一级标题",
      icon: "i-tabler-h-1",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      label: "二级标题",
      icon: "i-tabler-h-2",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      label: "三级标题",
      icon: "i-tabler-h-3",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    {
      label: "四级标题",
      icon: "i-tabler-h-4",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 4 }).run();
      },
    },
    {
      label: "五级标题",
      icon: "i-tabler-h-5",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 5 }).run();
      },
    },
    {
      label: "六级标题",
      icon: "i-tabler-h-6",
      click: () => {
        editor.value?.chain().focus().toggleHeading({ level: 6 }).run();
      },
    },
  ],
];
</script>

<template>
  <div class="flex items-center px-4 pb-3 pt-5">
    <input
      v-model="article.name"
      class="flex-1 bg-transparent text-2xl outline-none"
      @input="updateArticleName"
    />
  </div>
  <div v-if="editor" class="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
    <div class="flex flex-wrap items-center gap-2 px-4 py-2">
      <UButton
        v-if="editor.can().chain().focus().toggleBold().run()"
        size="xs"
        icon="i-tabler-bold"
        title="粗体"
        :color="editor.isActive('bold') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleItalic().run()"
        size="xs"
        icon="i-tabler-italic"
        title="斜体"
        :color="editor.isActive('italic') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleStrike().run()"
        size="xs"
        icon="i-tabler-strikethrough"
        title="删除线"
        :color="editor.isActive('strike') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleStrike().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleCode().run()"
        size="xs"
        icon="i-tabler-code"
        title="代码"
        :color="editor.isActive('code') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleCode().run()"
      />
      <UButton
        v-if="editor.can().chain().focus().toggleHighlight().run()"
        size="xs"
        icon="i-tabler-highlight"
        title="高亮"
        :color="editor.isActive('highlight') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleHighlight().run()"
      />
      <UButton size="xs" icon="i-tabler-eraser" color="white" @click="clear" />
      <UButton
        icon="i-tabler-letter-p"
        size="xs"
        title="段落"
        :color="editor.isActive('paragraph') ? 'black' : 'white'"
        @click="editor.chain().focus().setParagraph().run()"
      />
      <UDropdown :items="items" mode="hover">
        <UButton
          size="xs"
          icon="i-tabler-heading"
          title="标题"
          :color="editor.isActive('heading') ? 'black' : 'white'"
        />
      </UDropdown>
      <UButton
        size="xs"
        icon="i-tabler-list"
        title="列表"
        :color="editor.isActive('bulletList') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-list-numbers"
        title="有序列表"
        :color="editor.isActive('orderedList') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-source-code"
        title="代码块"
        :color="editor.isActive('codeBlock') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-blockquote"
        title="引用"
        :color="editor.isActive('blockquote') ? 'black' : 'white'"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <UButton
        size="xs"
        icon="i-tabler-spacing-vertical"
        color="white"
        title="分割线"
        @click="editor.chain().focus().setHorizontalRule().run()"
      />
      <UButton
        size="xs"
        color="white"
        title="强制换行"
        icon="i-tabler-corner-down-left-double"
        @click="editor.chain().focus().setHardBreak().run()"
      />
      <UButton
        v-if="!editor.isActive('table')"
        size="xs"
        color="white"
        icon="i-tabler-table"
        title="表格"
        @click="editor.chain().focus().insertTable({ rows: 5, cols: 3 }).run()"
      />
    </div>
    <div v-if="editor.isActive('table')" class="flex flex-wrap gap-2 px-4 pb-2">
      <UButton @click="editor.chain().focus().addColumnBefore().run()">
        addColumnBefore
      </UButton>
      <UButton @click="editor.chain().focus().addColumnAfter().run()">
        addColumnAfter
      </UButton>
      <UButton @click="editor.chain().focus().deleteColumn().run()">
        deleteColumn
      </UButton>
      <UButton @click="editor.chain().focus().addRowBefore().run()">
        addRowBefore
      </UButton>
      <UButton @click="editor.chain().focus().addRowAfter().run()">
        addRowAfter
      </UButton>
      <UButton @click="editor.chain().focus().deleteRow().run()">
        deleteRow
      </UButton>
      <UButton @click="editor.chain().focus().deleteTable().run()">
        deleteTable
      </UButton>
      <UButton @click="editor.chain().focus().mergeCells().run()">
        mergeCells
      </UButton>
      <UButton @click="editor.chain().focus().splitCell().run()">
        splitCell
      </UButton>
      <UButton @click="editor.chain().focus().toggleHeaderColumn().run()">
        toggleHeaderColumn
      </UButton>
      <UButton @click="editor.chain().focus().toggleHeaderRow().run()">
        toggleHeaderRow
      </UButton>
      <UButton @click="editor.chain().focus().toggleHeaderCell().run()">
        toggleHeaderCell
      </UButton>
      <UButton @click="editor.chain().focus().mergeOrSplit().run()">
        mergeOrSplit
      </UButton>
      <UButton
        @click="editor.chain().focus().setCellAttribute('colspan', 2).run()"
      >
        setCellAttribute
      </UButton>
      <UButton @click="editor.chain().focus().fixTables().run()">
        fixTables
      </UButton>
      <UButton @click="editor.chain().focus().goToNextCell().run()">
        goToNextCell
      </UButton>
      <UButton @click="editor.chain().focus().goToPreviousCell().run()">
        goToPreviousCell
      </UButton>
    </div>
  </div>
  <EditorContent :editor="editor" class="mx-4 mt-3 flex-1 pb-10" />
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

.tiptap > * p {
  margin: 0;
}

.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd8a;
  pointer-events: none;
}

.tiptap table th {
  background-color: rgba(137, 141, 145, 0.168);
}
.tiptap table th,
.tiptap table td {
  position: relative;
  border: 1px solid var(--tw-prose-td-borders);
  padding: 0.4em 0.5em;
}
.tiptap table .selectedCell:after {
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(66, 140, 92, 0.097);
  pointer-events: none;
}

.tiptap .ProseMirror-gapcursor::after {
  border-top: 1px solid var(--tw-prose-body);
}
</style>
