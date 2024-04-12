<script setup lang="ts">
import { cloneDeep, pick } from "lodash-es";
import { useUserStore } from "~/composables/user";
import { login_schema } from "../login.vue";
import { z } from "zod";

const store = useUserStore();
await store.checkLogin();

const state = reactive({
  ...store.user,
});

const schema = login_schema.extend({
  avatar: z.string(),
});

const lastState = reactive(cloneDeep(state));
const isChange = (prop: keyof typeof state) => {
  return state[prop] !== lastState[prop];
};
const submit = async <T extends keyof z.input<typeof schema>>(prop: T) => {
  const verify = schema.pick({ [prop]: true });
  const verifyResult = verify.safeParse(state);
  if (!verifyResult.success) return;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: pick(state, prop),
  });
  store.user = res;
  lastState[prop] = state[prop];
};

const imagePicker = useFileDialog({ accept: "image/*" });
imagePicker.onChange(async (files) => {
  if (!files?.length) return;
  if (!store.user) return;
  const [file] = files;
  const key = `home/${store.user.id}/avatar/${file.name}`;
  await upload_file(key, file);
  state.avatar = key;
  await submit("avatar");
});

const handleChangeAvatar = () => imagePicker.open();
</script>

<template>
  <UContainer class="py-6">
    <UForm :state="state" :schema="login_schema" class="space-y-4">
      <UFormGroup label="头像" name="avatar">
        <UAvatar
          :src="`https://cdn.fisschl.world/${state.avatar}`"
          class="cursor-pointer"
          size="lg"
          @click="handleChangeAvatar"
        />
      </UFormGroup>
      <UFormGroup label="用户名" name="name">
        <div class="flex">
          <UInput
            v-model="state.name"
            placeholder="请输入用户名"
            class="mr-3"
          />
          <UButton
            v-if="isChange('name')"
            icon="i-tabler-check"
            @click="submit('name')"
          />
        </div>
      </UFormGroup>
      <UFormGroup label="密码" name="password">
        <div class="flex">
          <UInput
            v-model="state.password"
            style="max-width: 20rem"
            placeholder="请输入密码"
            class="mr-3"
            type="password"
          />
          <UButton
            v-if="isChange('password')"
            icon="i-tabler-check"
            @click="submit('password')"
          />
        </div>
      </UFormGroup>
    </UForm>
  </UContainer>
</template>
