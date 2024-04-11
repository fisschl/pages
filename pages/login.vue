<script setup lang="ts">
import { pick } from "lodash-es";
import { z } from "zod";

const schema = z.object({
  name: z.string({ required_error: "用户名不能为空" }).min(3, "用户名太短了"),
  password: z.string({ required_error: "密码不能为空" }).min(6, "密码太短了"),
});

type Schema = z.output<typeof schema>;

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
  const data = schema.parse(state);
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
