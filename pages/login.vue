<script lang="ts" setup>
import { isString } from "lodash-es";
import { useUserStore } from "~/composables/user";

const { query } = useRoute();

const store = useUserStore();

/**
 * https://gitee.com/api/v5/oauth_doc
 */
const login = async () => {
  location.href = location.origin + "/api/auth/oauth";
};

const token = useCookie("token", {
  // 120 天
  maxAge: 60 * 60 * 24 * 120,
});

onMounted(() => {
  const { from } = query;
  if (!from || !isString(from)) return;
  localStorage.setItem("pages_login_from", from);
  if (store.info && token.value) {
    const target = new URL(from);
    target.searchParams.set("token", token.value);
    location.href = target.toString();
  }
});

onMounted(async () => {
  const { code } = query;
  if (!code || !isString(code)) return;
  const data = await $fetch("/api/auth/access", {
    query: { code },
  });
  store.info = data.user;
  token.value = data.token;
  await new Promise((resolve) => setTimeout(resolve, 100));
  const from = localStorage.getItem("pages_login_from");
  if (!from) location.href = location.origin;
  else location.href = from;
});
</script>

<template>
  <UContainer class="flex h-dvh items-center justify-center py-6">
    <UButton icon="i-tabler-brand-git" @click="login">
      使用 Gitee 登录
    </UButton>
  </UContainer>
</template>
