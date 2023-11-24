<script setup lang="ts">
import type { User } from "@prisma/client";
import { isEmpty } from "lodash-es";

definePageMeta({
  layout: false,
});

const state = reactive<Partial<User>>({});
const errors = ref<Partial<Record<keyof typeof state, string>>>({});

const validate = () => {
  errors.value = {};
  if (!state.name) errors.value.name = "必填";
  if (!state.password) errors.value.password = "必填";
  return isEmpty(errors.value);
};

const isRegister = ref(false);
const store = useUserStore();
const router = useRouter();
const route = useRoute();

const onSubmit = async () => {
  if (!validate()) return;
  if (isRegister.value) {
    await $fetch("/api/register", {
      method: "POST",
      body: state,
      onResponseError: () => {
        errors.value.name = "用户名已存在";
      },
    });
  }
  await $fetch("/api/login", {
    query: state,
    onResponseError: () => {
      errors.value.password = "用户名或密码错误";
    },
  });
  const u = await $fetch("/api/user");
  store.u = u;
  const from = route.query.from?.toString();
  await router.push(from || "/");
};
</script>

<template>
  <main
    class="flex h-screen w-screen items-center justify-center overflow-hidden"
  >
    <UForm :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="用户名" name="name" :error="errors.name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="密码" name="password" :error="errors.password">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>
      <UCheckbox v-model="isRegister" name="isRegister" label="注册用户" />
      <UButton type="submit" block> 登 录 </UButton>
    </UForm>
  </main>
</template>
