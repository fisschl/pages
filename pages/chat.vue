<script setup lang="ts">
import { debounce, first } from "lodash-es";
import { MessageSchema, type Message } from "~/components/chat/Message.vue";
import { useUserStore } from "~/composables/user";
import type { MessagesQuery } from "~/server/api/chat/messages";

const userStore = useUserStore();
const user = await userStore.checkLogin();

const headers = useRequestHeaders(["cookie"]);

const fetchData = async (param?: MessagesQuery) => {
  const res = await $fetch<Message[]>("/api/chat/messages", {
    query: param,
    headers,
  });
  return res;
};

const { data: list } = await useAsyncData(() => fetchData());

const isMounted = useMounted();
const { directions, y: scrollTop } = useScroll(() => {
  return isMounted.value ? document.body : undefined;
});

const scrollToBottom = async () => {
  await nextTick();
  const { body } = document;
  body.scrollTop = body.scrollHeight;
};
onMounted(scrollToBottom);

const scroll_top_throttled = refThrottled(scrollTop, 200);

const isShowScrollButton = computed(() => {
  if (!isMounted.value) return;
  const { body } = document;
  const { scrollHeight, clientHeight } = body;
  const bottom = scrollHeight - scroll_top_throttled.value - clientHeight;
  return bottom > 100;
});

const handleNewMessage = (message: Message) => {
  if (!list.value) return;
  const item = list.value?.find((item) => item.id === message.id);
  if (!item) list.value?.push(message);
  else Object.assign(item, message);
  if (!directions.top && !isShowScrollButton.value) scrollToBottom();
};

const { eventSource, status, open } = useEventSource(
  `/api/sse?key=${user?.id}`,
);

useEventListener(eventSource, "message", (e) => {
  if (!(e instanceof MessageEvent)) return;
  const data = JSON.parse(e.data);
  const res = MessageSchema.safeParse(data);
  if (!res.success) {
    console.log("不符合 SSE 响应规则", data);
    return;
  }
  console.log("SSE 响应", data);
  handleNewMessage(data);
});

const inputText = ref<string>();
const inputFiles = ref<string[]>();

const send = debounce(async () => {
  inputText.value = inputText.value?.trim();
  const param = { content: inputText.value, images: inputFiles.value };
  if (!param.content) return;
  inputFiles.value = [];
  inputText.value = undefined;
  if (status.value === "CLOSED") open();
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

const isAll = ref(false);
const message_component = useId();

whenever(
  () => directions.top && scrollTop.value < 100 && !isAll.value,
  async () => {
    if (!list.value?.length) return;
    const res = await fetchData({
      update_at: first(list.value)?.update_at,
    });
    if (!res.length) return (isAll.value = true);
    await nextTick();
    // 记忆滚动位置
    const firstElement = document.querySelector("." + message_component);
    const oldRect = firstElement?.getBoundingClientRect();
    list.value.unshift(...res);
    await nextTick();
    const newRect = firstElement?.getBoundingClientRect();
    if (!oldRect || !newRect) return scrollToBottom();
    // 恢复滚动位置
    const { body } = document;
    body.scrollBy({ top: newRect.top - oldRect.top });
  },
);
</script>

<template>
  <UContainer class="flex min-h-dvh flex-col py-5">
    <article class="prose mb-8 mt-4 max-w-none dark:prose-invert">
      <blockquote>
        早上好，夜之城。 已授权访问。 当前模型：
        <strong> gpt-4-vision-preview </strong>
        。 对话将携带
        <strong> 9 </strong>
        条历史记录。 若使用时发生异常，请联系管理员。
      </blockquote>
    </article>
    <div class="flex flex-1 flex-col items-start gap-5">
      <ChatMessage
        v-for="item in list"
        :key="item.id"
        :message="item"
        :class="message_component"
      />
    </div>
    <UDivider class="mb-4 mt-5" />
    <UTextarea
      v-model="inputText"
      autoresize
      placeholder="请输入"
      @keydown.enter="handleKeydown"
    />
    <div class="my-3 flex items-start">
      <section class="flex flex-1 items-start">
        <img
          v-for="item in inputFiles"
          :key="item"
          class="mr-2 size-12 object-cover"
          :src="`https://cdn.fisschl.world/${item}`"
          alt="..."
        />
      </section>
      <ChatUpload v-model:files="inputFiles" class="mr-3" />
      <UButton icon="i-tabler-send" class="px-6" @click="send"> 发送 </UButton>
    </div>
    <UButton
      v-if="isShowScrollButton"
      size="lg"
      variant="soft"
      icon="i-tabler-chevrons-down"
      class="fixed bottom-10 left-1/2 -translate-x-1/2"
      @click="scrollToBottom"
    />
  </UContainer>
</template>
