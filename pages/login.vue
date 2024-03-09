<script setup lang="ts">
import type { FormError } from "#ui/types";
import { pick } from "lodash-es";

const state = reactive({
  name: "",
  password: "",
  isRegister: false,
});
const errors = ref<FormError[]>([]);

const validate = (data: typeof state) => {
  errors.value = [];
  if (!data.name) {
    errors.value.push({
      path: "name",
      message: "请填写用户名",
    });
  }
  if (!data.password) {
    errors.value.push({
      path: "password",
      message: "请填写密码",
    });
  }
  return errors.value;
};

const store = useUserStore();
const route = useRoute();

const onSubmit = async () => {
  if (state.isRegister) {
    try {
      await $fetch("/api/user", {
        method: "POST",
        body: pick(state, ["name", "password"]),
      });
    } catch (e) {
      errors.value.push({
        path: "name",
        message: "用户名已存在",
      });
      return;
    }
  }
  try {
    store.user = await $fetch("/api/auth", {
      method: "POST",
      body: pick(state, ["name", "password"]),
    });
    const { from } = route.query;
    if (!from || typeof from !== "string") return;
    location.href = from;
  } catch (e) {
    errors.value.push({
      path: "password",
      message: "用户名或密码错误",
    });
    return;
  }
};
</script>

<template>
  <main
    class="flex h-screen w-screen items-center justify-center overflow-hidden"
  >
    <UForm
      :state="state"
      class="space-y-4"
      :validate="validate"
      @submit="onSubmit"
    >
      <UFormGroup label="用户名" name="name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <UFormGroup label="密码" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>
      <UCheckbox
        v-model="state.isRegister"
        name="isRegister"
        label="注册用户"
      />
      <UButton type="submit" block> 登 录 </UButton>
    </UForm>
  </main>
</template>
