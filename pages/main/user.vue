<script setup lang="ts">
import { isEmpty } from "lodash-es";
import { useUserStore } from "~/composables/user";
import { ofetch } from "ofetch";
import type {
  FormInstance,
  FormRules,
  UploadRequestHandler,
} from "element-plus";
import { changed } from "~/utils/util";

const store = useUserStore();
await store.checkLogin();

const form = ref<FormInstance>();

const state = reactive({
  name: store.user?.name,
  password: store.user?.password,
});

const rules = reactive<FormRules<typeof state>>({
  name: [{ required: true, message: "请输入用户名" }],
  password: [{ required: true, message: "请输入密码" }],
});

const submit = async () => {
  await form.value?.validate();
  const param = changed(state, store.user);
  if (isEmpty(param)) return;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: param,
  });
  store.user = res;
};

const handleUpload: UploadRequestHandler = async ({ file }) => {
  if (!store.user) return;
  const { avatar } = await $fetch("/api/user/avatar", {
    method: "POST",
    body: { type: file.type, name: file.name },
  });
  await ofetch("/oss/delete", {
    baseURL: "https://bronya.world",
    method: "DELETE",
    query: {
      key: `home/${store.user.id}/avatar/${store.user.avatar}`,
    },
    headers: {
      token: store.token || "",
    },
  });
  await upload_file(`home/${store.user.id}/avatar/${avatar}`, file);
  store.user.avatar = avatar;
};
</script>

<template>
  <UContainer class="py-6">
    <ElForm ref="form" :model="state" :rules="rules" @submit.prevent="submit">
      <ElFormItem label="头像" label-width="80">
        <ElAvatar
          :src="store.avatar"
          style="width: 5rem; height: 5rem"
          class="mr-3"
        />
        <ElUpload
          accept="image/*"
          :show-file-list="false"
          :http-request="handleUpload"
        >
          <ElButton> 修改头像 </ElButton>
        </ElUpload>
      </ElFormItem>
      <ElFormItem label="用户名" label-width="80" prop="name">
        <ElInput
          v-model="state.name"
          style="max-width: 20rem"
          placeholder="请输入用户名"
        />
      </ElFormItem>
      <ElFormItem label="密码" label-width="80" prop="password">
        <ElInput
          v-model="state.password"
          placeholder="请输入密码"
          type="password"
          style="max-width: 20rem"
          show-password
        />
      </ElFormItem>
      <ElButton
        native-type="submit"
        style="margin-left: 80px"
        type="primary"
        class="mt-3 !px-6"
      >
        保 存
      </ElButton>
    </ElForm>
  </UContainer>
</template>
