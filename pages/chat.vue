<script lang="ts" setup>
import "~/assets/markdown.css";
import "katex/dist/katex.min.css";
import { debounce } from "lodash-es";
import { onMounted } from "vue";
import { type Message, message_schema } from "~/components/chat/type";
import { useLockScroll } from "~/composables/lockScroll";
import { useSocket } from "~/composables/socket";
import ImageViewer from "~/components/ImageViewer.vue";

useHead({
  title: "GPT",
});

const model = useState(() => "");
const list = useState<Message[]>(() => []);

const isMounted = useMounted();
const scrollTarget = computed(() => {
  if (!isMounted.value) return;
  if (typeof window === "undefined") return;
  return document.getElementById("__nuxt");
});

const list_element = ref<HTMLElement>();

const streaming = ref(false);

const { scrollToBottom, directions, throttledScrollTop, arrivedState } =
  useLockScroll({
    scrollTarget: scrollTarget,
    resizeTarget: list_element,
    disabled: streaming,
    direction: "bottom",
  });

const isShowScrollButton = computed(() => {
  if (!scrollTarget.value) return;
  const { scrollHeight, clientHeight } = scrollTarget.value;
  const bottom = scrollHeight - throttledScrollTop.value - clientHeight;
  return bottom > 100;
});

const inputText = ref<string>();
const inputFiles = ref<string[]>();

const send = debounce(async () => {
  inputText.value = inputText.value?.trim();
  const param = { content: inputText.value, images: inputFiles.value };
  if (!param.content) return;
  inputFiles.value = [];
  inputText.value = undefined;
  streaming.value = true;
  await $fetch("/api/chat/send", {
    method: "POST",
    body: param,
  });
  streaming.value = false;
}, 200);

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  await send();
};

const socket = useSocket();
const token = useCookie("token");

onMounted(async () => {
  const data = await $fetch("/api/chat/client");
  const { info } = user;
  if (!info || !token.value) return;
  await socket.connect({
    username: data.token,
    topic: `${info.id}/ai_chat`,
    clientId: token.value,
  });
});

onMounted(scrollToBottom);

const updateMessageContent = async (message: Message) => {
  const article = document.getElementById(`article_${message.message_id}`);
  if (!article) return;
  const { update } = await import("~/utils/snabbdom");
  await update(article, message.content);
  if (message.status === "stable") {
    const { mountContent } = await import("~/utils/markdown");
    await mountContent(article);
  }
};

socket.on(async (event) => {
  const res = message_schema.safeParse(event);
  if (!res.success) return;
  const message = res.data;
  const item = list.value.findLast(
    (item) => item.message_id === message.message_id,
  );
  if (!item) list.value = [...list.value, message];
  else {
    Object.assign(item, message);
    await updateMessageContent(message);
  }
  await nextTick();
  if (!directions.top && !isShowScrollButton.value) scrollToBottom();
});

const isLoadAll = ref(false);

const loading = ref(false);

const shouldLoadMore = computed(() => {
  if (!scrollTarget.value || loading.value) return;
  if (isLoadAll.value || !list.value.length) return;
  return directions.top && arrivedState.top;
});

whenever(shouldLoadMore, async () => {
  if (!list.value.length) return;
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const [item] = list.value;
  const res = await $fetch("/api/chat/messages", {
    query: {
      create_time: item.create_time,
    },
  });
  if (!res.list.length) isLoadAll.value = true;
  list.value = [...res.list, ...list.value];
  loading.value = false;
});

const headers = useRequestHeaders(["cookie"]);

await callOnce(async () => {
  const res = await $fetch("/api/chat/messages", {
    headers,
  });
  list.value = res.list;
  model.value = res.model;
});
</script>

<template>
  <UContainer>
    <ol
      ref="list_element"
      :class="$style.list_element"
      class="mt-5 flex flex-1 flex-col items-start"
    >
      <ChatMessage
        v-for="item in list"
        :key="item.message_id"
        :message="item"
      />
    </ol>
    <UDivider :label="model" class="mb-4 mt-1" />
    <UTextarea
      v-model="inputText"
      :autoresize="true"
      placeholder="请输入"
      @keydown.enter="handleKeydown"
    />
    <div class="mb-5 mt-3 flex items-start">
      <section class="flex-1"></section>
      <section class="flex items-center">
        <UButton
          :loading="streaming"
          class="px-6"
          icon="i-tabler-send"
          @click="send"
        >
          发送
        </UButton>
      </section>
    </div>
    <ChatLoading :loading="loading" />
    <ImageViewer />
  </UContainer>
</template>

<style module>
.list_element {
  min-height: calc(100vh - 14rem);
}
</style>
