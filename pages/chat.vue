<script setup lang="ts">
import { debounce, remove } from "lodash-es";
import { message_schema, type Message } from "~/components/chat/type";
import { useUserStore } from "~/composables/user";
import type { MessagesQuery } from "~/server/api/chat/messages";

onMounted(async () => {
  const { music, play } = await import("~/components/main/MusicButton.vue");
  music.value = {
    source: "https://cdn.fisschl.world/static/大哉乾元.opus",
  };
  await play();
});
onBeforeUnmount(async () => {
  const { hide } = await import("~/components/main/MusicButton.vue");
  await hide();
});

const { user, checkLogin } = useUserStore();
await checkLogin();

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

const scrollToBottom = () => {
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

const handleNewMessage = async (message: Message) => {
  if (!list.value) return;
  const item = list.value?.find((item) => item.id === message.id);
  if (!item) {
    list.value.push(message);
    return;
  }
  Object.assign(item, message);
  const { updateMessage } = await import("~/components/chat/update");
  await updateMessage(item);
};

const { eventSource, status, open } = useEventSource(
  `/api/socket?key=${user?.id}`,
);

useEventListener(eventSource, "message", async (e) => {
  if (!(e instanceof MessageEvent)) return;
  const data = JSON.parse(e.data);
  const res = message_schema.safeParse(data);
  if (!res.success) {
    console.log("不符合 SSE 响应规则", data, res.error);
    return;
  }
  console.log("SSE 响应", res.data);
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

const isLoadAll = ref(false);

const loading = ref(false);

const shouldLoadMore = computed(() => {
  if (!isMounted.value || loading.value) return;
  if (isLoadAll.value || !list.value?.length) return;
  return directions.top && scrollTop.value < 10;
});

whenever(shouldLoadMore, async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const [item] = list.value!;
  const res = await fetchData({
    create_at: item.create_at,
  });
  if (!res.length) {
    loading.value = false;
    isLoadAll.value = true;
    return;
  }
  await nextTick();
  // 记忆滚动位置
  const firstElement = document.getElementById(item.id);
  const oldRect = firstElement?.getBoundingClientRect();
  list.value!.unshift(...res);
  await nextTick();
  const newRect = firstElement?.getBoundingClientRect();
  if (!oldRect || !newRect) {
    loading.value = false;
    await nextTick();
    return scrollToBottom();
  }
  // 恢复滚动位置
  const { body } = document;
  body.scrollBy({ top: newRect.top - oldRect.top });
  loading.value = false;
});

const handleDelete = (message: Message) => {
  if (!list.value) return;
  remove(list.value, (item) => item.id === message.id);
};
</script>

<template>
  <MainHeader />
  <UContainer>
    <div class="flex min-h-dvh flex-1 flex-col items-start gap-5">
      <ChatMessage
        v-for="item in list"
        :key="item.id"
        :message="item"
        @delete="handleDelete"
      />
    </div>
    <UDivider class="mb-4 mt-5 !w-auto" />
    <UTextarea
      v-model="inputText"
      autoresize
      placeholder="请输入"
      @keydown.enter="handleKeydown"
    />
    <div class="mb-5 mt-3 flex items-start">
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
  </UContainer>
  <UButton
    v-if="isShowScrollButton"
    size="lg"
    variant="soft"
    icon="i-tabler-chevrons-down"
    class="fixed bottom-10 left-1/2 -translate-x-1/2"
    @click="scrollToBottom"
  />
  <Transition :enter-from-class="$style.enter" :leave-to-class="$style.enter">
    <div
      v-if="loading"
      class="z-30 bg-gray-100 p-2 shadow dark:bg-gray-800"
      :class="$style.loader"
    >
      <Icon
        name="i-tabler-loader"
        class="animate-spin"
        style="font-size: 18px"
      />
    </div>
  </Transition>
</template>

<style module>
.loader {
  position: fixed;
  left: 50%;
  top: 2rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 200ms;
  opacity: 1;
}

.loader.enter {
  top: 6px;
  opacity: 0;
}
</style>
