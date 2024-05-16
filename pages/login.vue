<script setup lang="ts">
import { pick } from "lodash-es";
import type { z } from "zod";
import { login_schema, useUserStore } from "~/composables/user";

const { query } = useRoute();

const redirect = async (token: string) => {
  const { from } = query;
  if (!from || typeof from !== "string") return;
  const uri = new URL(from);
  uri.searchParams.set("token", token);
  await navigateTo(uri.toString(), { external: true });
};

const store = useUserStore();
const cookie = useCookie("token");
if (cookie.value && store.user) await redirect(cookie.value);

type Schema = z.output<typeof login_schema>;

const state = reactive<Partial<Schema>>({});

const isRegister = ref(false);
const toast = useToast();

const register = async (data: Schema) => {
  const res = await $fetch("/api/user", {
    method: "POST",
    body: pick(data, ["name", "password"]),
  }).catch(() => {
    toast.add({ title: "用户名已存在" });
  });
  if (!res) return;
  toast.add({ title: res.message });
};

const onSubmit = async () => {
  const data = login_schema.parse(state);
  if (isRegister.value) await register(data);
  const res = await $fetch("/api/auth", {
    method: "POST",
    body: pick(data, ["name", "password"]),
  }).catch(() => {
    toast.add({ title: "用户名或密码错误" });
  });
  if (!res) return;
  const { token } = res;
  await redirect(token);
};
</script>

<template>
  <main class="flex h-dvh w-screen items-center justify-center overflow-hidden">
    <UForm
      :state="state"
      :schema="login_schema"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="用户名" name="name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="密码" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>
      <UCheckbox v-model="isRegister" name="isRegister" label="注册用户" />
      <UButton type="submit" block> 登 录 </UButton>
    </UForm>
  </main>
</template>
