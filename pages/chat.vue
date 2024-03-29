<script setup lang="ts">
import { debounce, throttle } from "lodash-es";
import { useUserStore } from "~/composables/user";

const userStore = useUserStore();
const user = await userStore.checkLogin();

interface Message {
  id: string;
  update_at?: string;
  role: string;
  content: string;
}

const last_time = ref<string>();
const headers = useRequestHeaders(["cookie"]);

const fetchData = async () => {
  return $fetch<Message[]>("/api/chat/messages", {
    query: {
      update_at: last_time.value,
    },
    headers,
  });
};

const { data: list } = await useAsyncData(fetchData);

const updateMessageItem = throttle(async (target: Message, source: Message) => {
  Object.assign(target, source);
}, 100);

const handleNewMessage = (message: Message) => {
  if (!list.value) return;
  const item = list.value?.find((item) => item.id === message.id);
  if (!item) {
    list.value?.push(message);
  } else {
    updateMessageItem(item, message);
  }
  const { body } = document;
  const bottom = body.scrollHeight - body.scrollTop - body.clientHeight;
  if (bottom < 100) body.scrollTop = body.scrollHeight;
};

onMounted(() => {
  const { body } = document;
  body.scrollTop = body.scrollHeight;
});

const { eventSource } = useEventSource(`/api/sse?key=${user?.id}`);

useEventListener(eventSource, "message", (e) => {
  if (!(e instanceof MessageEvent)) return;
  const data = JSON.parse(e.data);
  if (data.method !== "AI对话") return;
  handleNewMessage(data);
});

const inputText = ref<string>();

const send = debounce(async () => {
  inputText.value = inputText.value?.trim();
  const content = inputText.value;
  if (!content) return;
  inputText.value = undefined;
  await $fetch("/api/chat/send", {
    method: "POST",
    body: {
      content: content,
    },
  });
}, 200);

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  send();
};

const welcome = `
> 早上好，夜之城。
> 已授权访问。
> 当前模型：**gpt-4-turbo-preview**。
> 对话将携带 **9** 条历史记录。
`;
</script>

<template>
  <UContainer class="flex min-h-dvh flex-col py-5">
    <MDC
      tag="article"
      :value="welcome"
      class="prose prose-sm mb-4 max-w-none dark:prose-invert"
    />
    <div class="flex flex-1 flex-col items-start gap-5">
      <section
        v-for="item in list"
        :key="item.id"
        class="rounded px-3 py-2"
        :class="{
          'bg-stone-500/10': item.role === 'assistant',
          'bg-violet-500/15': item.role === 'user',
        }"
      >
        <MDC
          tag="article"
          :value="item.content"
          class="prose prose-sm max-w-none dark:prose-invert"
        />
      </section>
    </div>
    <UDivider class="mb-4 mt-5" />
    <UTextarea
      v-model="inputText"
      autoresize
      placeholder="请输入"
      @keydown.enter="handleKeydown"
    />
    <div class="my-3 flex">
      <span class="flex-1"></span>
      <UButton icon="i-tabler-send" class="px-6" @click="send"> 发送 </UButton>
    </div>
  </UContainer>
</template>
