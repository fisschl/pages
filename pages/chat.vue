<script setup lang="ts">
import { debounce, first } from "lodash-es";
import { z, type output } from "zod";
import { useUserStore } from "~/composables/user";
import type { MessagesQuery } from "~/server/api/chat/messages";

const userStore = useUserStore();
const user = await userStore.checkLogin();

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  update_at: z.string().optional(),
  files: z
    .array(
      z.object({
        key: z.string(),
      }),
    )
    .optional(),
});

type Message = output<typeof MessageSchema>;

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
const { directions, y: originalScrollTop } = useScroll(() => {
  return isMounted.value ? document.body : undefined;
});

const scrollToBottom = async () => {
  await nextTick();
  const { body } = document;
  body.scrollTop = body.scrollHeight;
};
onMounted(scrollToBottom);

const scrollTop = refThrottled(originalScrollTop, 200);

const isShowScrollButton = computed(() => {
  if (!isMounted.value) return;
  const { body } = document;
  const { scrollHeight, clientHeight } = body;
  const bottom = scrollHeight - scrollTop.value - clientHeight;
  return bottom > 100;
});

const handleNewMessage = (message: Message) => {
  if (!list.value) return;
  const item = list.value?.find((item) => item.id === message.id);
  if (!item) {
    list.value?.push(message);
  } else {
    Object.assign(item, message);
  }
  if (directions.top) return;
  const { body } = document;
  const { scrollHeight, scrollTop, clientHeight } = body;
  const bottom = scrollHeight - scrollTop - clientHeight;
  if (bottom < 80) return scrollToBottom();
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
  handleNewMessage(data);
});

const inputText = ref<string>();
const inputFiles = ref<string[]>();

const send = debounce(async () => {
  inputText.value = inputText.value?.trim();
  const content = inputText.value;
  if (!content) return;
  inputText.value = undefined;
  await $fetch("/api/chat/send", {
    method: "POST",
    body: { content: content, images: inputFiles.value },
  });
  if (status.value !== "OPEN") open();
}, 200);

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  await send();
};

const isAll = ref(false);
const thisStyle = useCssModule();
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
    const firstElement = document.querySelector("." + thisStyle.message);
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
        <strong> gpt-4-turbo-preview </strong>
        。 对话将携带
        <strong> 9 </strong>
        条历史记录。 若使用时发生异常，请联系管理员。
      </blockquote>
    </article>
    <div class="flex flex-1 flex-col items-start gap-5">
      <section
        v-for="item in list"
        :key="item.id"
        class="message rounded px-3 py-2"
        :class="{
          'bg-stone-500/10': item.role === 'assistant',
          'bg-violet-500/15': item.role === 'user',
          [$style.message]: true,
        }"
      >
        <article
          class="prose prose-sm max-w-none dark:prose-invert"
          v-html="item.content"
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
      <section v-if="inputFiles?.length">
        <img
          v-for="item in inputFiles"
          :key="item"
          class="w-10"
          :src="`https://cdn.fisschl.world/${item}`"
          :alt="item"
        />
      </section>
      <span class="flex-1" />
      <ChatUpload v-model:files="inputFiles" />
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

<style module>
.message {
  display: block;
}
</style>
