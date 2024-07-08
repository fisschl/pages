<script setup lang="ts">
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

onMounted(() => {
  const { from } = query;
  if (!from || !isString(from)) return;
  localStorage.setItem("pages_login_from", from);
  if (store.info && store.token) {
    // 有登录态，直接返回
    const uri = new URL(from);
    uri.searchParams.set("token", store.token);
    location.href = uri.toString();
  }
});

onMounted(async () => {
  const { code } = query;
  if (!code || !isString(code)) return;
  const res = await $fetch("/api/auth/access", {
    query: { code },
  });
  store.info = res;
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
