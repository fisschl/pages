<script setup lang="ts">
import { debounce, remove } from "lodash-es";
import { type Message, message_schema } from "~/components/chat/type";
import type { MessagesQuery } from "~/server/api/chat/messages";
import { useSocket } from "~/composables/socket";
import ImageViewer from "~/components/ImageViewer.vue";
import { scrollTarget } from "~/utils/page_scroll";
import { useScrollBottom } from "~/composables/scrollend";

useHead({
  title: "GPT",
  script: [
    {
      src: "https://static.bronya.world/npm/scrollyfills/dist/scrollyfills.modern.js",
      async: true,
      type: "module",
    },
  ],
});

const user = await useShouldLogin();

const fetchData = async (param?: MessagesQuery) => {
  return await $fetch<{
    list: Message[];
    model: string;
  }>("/api/chat/messages", {
    query: param,
    headers: useRequestHeaders(["cookie"]),
  });
};

const { data } = await useAsyncData(() => fetchData());

const isMounted = useMounted();
const scroll_element = computed(() => {
  return isMounted.value ? scrollTarget() : null;
});
const { directions, y: source_top } = useScroll(scroll_element);
const list_element = ref<HTMLElement>();
const { scrollToBottom } = useScrollBottom(scroll_element, list_element);

const top = refThrottled(source_top, 200);

const isShowScrollButton = computed(() => {
  if (!isMounted.value) return;
  const element = scrollTarget();
  if (!element) return;
  const { scrollHeight, clientHeight } = element;
  const bottom = scrollHeight - top.value - clientHeight;
  return bottom > 100;
});

const handleNewMessage = async (message: Message) => {
  if (!data.value) return;
  const { list } = data.value;
  if (!list) return;
  const item = list.findLast((item) => item.id === message.id);
  if (!item) {
    list.push(message);
    return;
  }
  Object.assign(item, message);
  const { updateMessage } = await import("~/components/chat/update");
  await updateMessage(item);
};

const token = useCookie("token");

const { onMessage } = useSocket({
  topic: user?.id || "public",
  username: user?.id,
  password: token.value || undefined,
});

onMessage(async (data) => {
  const res = message_schema.safeParse(data);
  if (!res.success) return;
  await handleNewMessage(res.data);
  await nextTick();
  if (!directions.top && !isShowScrollButton.value) scrollToBottom();
});

const inputText = ref<string>();
const inputFiles = ref<string[]>();

const send = debounce(async () => {
  inputText.value = inputText.value?.trim();
  const param = { content: inputText.value, images: inputFiles.value };
  if (!param.content) return;
  inputFiles.value = [];
  inputText.value = undefined;
  await $fetch("/api/chat/send", {
    method: "POST",
    body: param,
  });
}, 200);

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  await send();
};

const isLoadAll = ref(false);

const loading = ref(false);

const shouldLoadMore = computed(() => {
  if (!isMounted.value || loading.value) return;
  if (isLoadAll.value || !data.value?.list.length) return;
  return directions.top && source_top.value < 10;
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

const handleListItemClick = async (e: MouseEvent) => {
  const { target } = e;
  if (!(target instanceof Element)) return;
  const button = target.closest("button");
  if (!button) return;
  const li = button.closest("li");
  if (!li || !li.id) return;
  const message = data.value?.list.find((item) => item.id === li.id);
  if (!message) return;
  switch (button.title) {
    case "删除":
      await $fetch(`/api/chat/message`, {
        method: "DELETE",
        query: { id: message.id },
      });
      remove(data.value!.list, (item) => item.id === message.id);
      break;
    case "重新发送":
      scrollToBottom();
      await $fetch(`/api/chat/send`, {
        method: "POST",
        body: { chat_id: message.id },
      });
      break;
  }
};
</script>

<template>
  <UContainer>
    <ol
      ref="list_element"
      class="mt-5 flex flex-1 flex-col items-start"
      :class="$style.list_element"
      @click="handleListItemClick"
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
        v-for="item in inputFiles"
        :key="item"
        class="mr-2 size-12 object-cover"
        :src="item"
      />
      <span class="flex-1"></span>
      <section class="flex items-center">
        <UButton
          color="orange"
          icon="i-tabler-info-octagon"
          variant="soft"
          title="使用统计"
          class="mr-3"
          to="/chat_info"
        />
        <ChatUpload v-model:files="inputFiles" class="mr-3" />
        <UButton icon="i-tabler-send" class="px-6" @click="send">
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
