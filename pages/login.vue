<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import { pick } from "lodash-es";
import { object, string, type Output, minLength } from "valibot";

const schema = object({
  name: string([minLength(3, "请输入用户名")]),
  password: string([minLength(3, "请输入密码")]),
});

type Schema = Output<typeof schema>;

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

export type NuxtSubmit = (event: FormSubmitEvent<Schema>) => Promise<void>;

const onSubmit: NuxtSubmit = async ({ data }) => {
  if (isRegister.value) await register(data);
  const res = await $fetch("/api/auth", {
    method: "POST",
    body: pick(data, ["name", "password"]),
  }).catch(() => {
    toast.add({ title: "用户名或密码错误" });
  });
  if (!res) return;
  store.user = res;
  const { from } = route.query;
  if (!from || typeof from !== "string") return;
  location.href = from;
};

const store = useUserStore();
const route = useRoute();
</script>

<template>
  <main
    class="flex h-screen w-screen items-center justify-center overflow-hidden"
  >
    <UForm :state="state" :schema="schema" class="space-y-4" @submit="onSubmit">
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
