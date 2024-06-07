<script setup lang="ts">
import { debounce } from "lodash-es";
import { type Message, message_schema } from "~/components/chat/type";
import type { MessagesQuery } from "~/server/api/chat/messages";
import { useSocket } from "~/composables/socket";
import ImageViewer from "~/components/ImageViewer.vue";
import { useShouldLogin } from "~/composables/user";
import { onMounted } from "vue";
import { useLockScroll } from "~/composables/lock_scroll";

useHead({
  title: "GPT",
});

const user = await useShouldLogin();

const headers = useRequestHeaders(["cookie"]);

interface ListResponse {
  list: Message[];
  model: string;
}

const fetchData = async (param?: MessagesQuery) => {
  return $fetch<ListResponse>("/api/chat/messages", {
    query: param,
    headers,
  });
};

const { data } = await useAsyncData(() => fetchData());

const scrollTarget = useScrollTarget();

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

const token = useCookie("token");

const { eventHook } = useSocket({
  username: user?.id || "public",
  password: token.value || "public",
  topic: `${user?.id}/ai_chat`,
});

onMounted(() => {
  scrollToBottom();
});

eventHook.on(async (event) => {
  const res = message_schema.safeParse(event);
  if (!res.success) return;
  const message = res.data;
  if (!data.value) return;
  const { list } = data.value;
  if (!list) return;
  const item = list.findLast((item) => item.id === message.id);
  if (!item) list.push(message);
  else {
    Object.assign(item, message);
    const article = document.getElementById(`article_${message.id}`);
    if (!article) return;
    const { updateMessage } = await import("~/components/chat/update");
    await updateMessage(message, article);
  }
  await nextTick();
  if (!directions.top && !isShowScrollButton.value) scrollToBottom();
});

const isLoadAll = ref(false);

const loading = ref(false);

const shouldLoadMore = computed(() => {
  if (!scrollTarget.value || loading.value) return;
  if (isLoadAll.value || !data.value?.list.length) return;
  return directions.top && arrivedState.top;
});

whenever(shouldLoadMore, async () => {
  if (!data.value) return;
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const [item] = data.value.list;
  const { list } = await fetchData({
    create_at: item.create_at,
  });
  if (!list.length) isLoadAll.value = true;
  data.value.list = [...list, ...data.value.list];
  loading.value = false;
});
</script>

<template>
  <UContainer>
    <ol
      ref="list_element"
      class="mt-5 flex flex-1 flex-col items-start"
      :class="$style.list_element"
    >
      <ChatMessage v-for="item in data?.list" :key="item.id" :message="item" />
    </ol>
    <UDivider class="mb-4 mt-1" :label="data?.model" />
    <UTextarea
      v-model="inputText"
      autoresize
      placeholder="请输入"
      @keydown.enter="handleKeydown"
    />
    <div class="mb-5 mt-3 flex items-start">
      <ImageViewer
        v-for="(item, index) in inputFiles"
        :key="index"
        class="mr-2 size-12 object-cover"
        :src="item"
      />
      <span class="flex-1"></span>
      <section class="flex items-center">
        <ChatUpload v-model:files="inputFiles" class="mr-3" />
        <UButton
          icon="i-tabler-send"
          class="px-6"
          :loading="streaming"
          @click="send"
        >
          发送
        </UButton>
      </section>
    </div>
  </UContainer>
  <ChatBottomButton v-if="isShowScrollButton" />
  <ChatLoading :loading="loading" />
</template>

<style module>
.list_element {
  min-height: calc(100vh - 14rem);
}
</style>
