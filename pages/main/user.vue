<script setup lang="ts">
import { login_schema, useUserStore, user_schema } from "~/composables/user";

const store = useUserStore();
await useShouldLogin();

const state = reactive({
  ...store.user,
});

const schema = user_schema.merge(login_schema).pick({
  name: true,
  avatar: true,
});

const submit = async () => {
  const data = schema.safeParse(state);
  if (!data.success) return;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: data.data,
  });
  store.user = res;
};

const imagePicker = useFileDialog({ accept: "image/*" });
imagePicker.onChange(async (files) => {
  if (!files?.length) return;
  if (!store.user) return;
  const [file] = files;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise<Event>((resolve) => {
    reader.onload = resolve;
  });
  const { result: data_url } = reader;
  if (typeof data_url !== "string") return;
  const image = new Image();
  image.src = data_url;
  await new Promise<Event>((resolve) => {
    image.onload = resolve;
  });
  const canvas = document.createElement("canvas");
  const target_px = 512;
  canvas.width = target_px;
  canvas.height = target_px;
  const width = Math.min(image.width, image.height);
  const sx = (image.width - width) / 2;
  const sy = (image.height - width) / 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(image, sx, sy, width, width, 0, 0, target_px, target_px);
  const webp = canvas.toDataURL("image/webp");
  state.avatar = webp;
});

const cookie = useCookie("token");

const logout = async () => {
  cookie.value = undefined;
  store.user = undefined;
  await navigateTo("/");
};

const isShowPassword = ref(false);
const passState = reactive({
  password: "",
});
const pass_schema = login_schema.pick({
  password: true,
});

const handleChangePassword = async () => {
  const data = pass_schema.safeParse(passState);
  if (!data.success) return;
  await $fetch("/api/user", {
    method: "PUT",
    body: data.data,
  });
  isShowPassword.value = false;
};
</script>

<template>
  <UContainer class="py-6">
    <UDivider class="my-6" label="修改用户信息" />
    <UForm :state="state" :schema="schema" @submit="submit">
      <UFormGroup label="头像" class="mb-4" name="avatar">
        <UAvatar
          :src="state.avatar"
          class="cursor-pointer"
          size="xl"
          @click="imagePicker.open"
        />
      </UFormGroup>
      <UFormGroup label="用户名" class="mb-6" name="name">
        <UInput
          v-model="state.name"
          style="max-width: 20rem"
          placeholder="请输入用户名"
        />
      </UFormGroup>
      <div>
        <UButton type="submit" icon="i-tabler-check"> 保存 </UButton>
      </div>
    </UForm>
    <UDivider class="my-6" label="其他操作" />
    <div class="flex">
      <UButton
        icon="i-tabler-password-user"
        color="yellow"
        variant="soft"
        class="mr-6"
        @click="isShowPassword = true"
      >
        修改密码
      </UButton>
      <UButton
        icon="i-tabler-logout"
        color="red"
        class="mr-3"
        variant="soft"
        @click="logout"
      >
        退出登录
      </UButton>
    </div>
    <UModal v-model="isShowPassword">
      <UForm
        :schema="pass_schema"
        :state="passState"
        class="m-6"
        @submit="handleChangePassword"
      >
        <UFormGroup label="请输入密码" name="password">
          <UInput
            v-model="passState.password"
            style="max-width: 20rem"
            placeholder="请输入密码"
            type="password"
            class="mb-4"
          />
        </UFormGroup>
        <UButton type="submit" icon="i-tabler-check"> 确定 </UButton>
      </UForm>
    </UModal>
  </UContainer>
</template>
