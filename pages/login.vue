<script setup lang="ts">
import { isString } from "lodash-es";
import { useUserStore } from "~/composables/user";

const { query } = useRoute();

const store = useUserStore();
const cookie = useCookie("token");

/**
 * https://gitee.com/api/v5/oauth_doc
 */
const login = async () => {
  const { from } = query;
  if (!from || !isString(from)) return;
  if (cookie.value && store.user) {
    // 有登录态，直接返回
    const uri = new URL(from);
    uri.searchParams.set("token", cookie.value);
    location.href = uri.toString();
  } else {
    // 无登录态，跳转登录页
    localStorage.setItem("pages_login_from", from);
    location.href = location.origin + "/api/auth/oauth";
  }
};

onMounted(async () => {
  const { code } = query;
  if (!code || !isString(code)) return;
  const res = await $fetch("/api/auth/access", {
    query: { code },
  });
  store.user = res;
  const from = localStorage.getItem("pages_login_from");
  localStorage.removeItem("pages_login_from");
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
