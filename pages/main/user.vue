<script setup lang="ts">
import type {
  FormInstance,
  FormRules,
  UploadRequestHandler,
} from "element-plus";
import { useUserStore } from "~/composables/user";

const store = useUserStore();
await store.checkLogin();

const form = ref<FormInstance>();
const state = reactive({
  ...store.user,
});
const rules = reactive<FormRules<typeof state>>({
  name: [{ required: true, message: "请输入用户名" }],
});
const { changedList, submitChanges } = useForm(state, async (params) => {
  await form.value?.validate();
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: params,
  });
  store.user = res;
});

const handleUpload: UploadRequestHandler = async ({ file }) => {
  if (!store.user) return;
  const key = `home/${store.user.id}/avatar/${file.name}`;
  await upload_file(key, file);
  state.avatar = key;
};

const handleChangePassword = async () => {
  const { value } = await ElMessageBox.prompt("请输入新密码", "提示");
  if (!value) {
    ElMessage.info("取消");
    return;
  }
  await $fetch("/api/user", {
    method: "PUT",
    body: { password: value },
  });
  ElMessage.success("修改成功");
};
</script>

<template>
  <UContainer class="py-6">
    <ElForm
      ref="form"
      :model="state"
      label-width="80"
      :rules="rules"
      @submit.prevent="submitChanges"
    >
      <ElFormItem label="头像" prop="avatar">
        <ElAvatar
          v-if="state.avatar"
          :src="`https://cdn.fisschl.world/${state.avatar}`"
          size="large"
          class="mr-3"
        />
        <ElUpload
          accept="image/*"
          :show-file-list="false"
          :http-request="handleUpload"
        >
          <ElButton>
            <UIcon
              name="i-tabler-upload"
              style="font-size: 16px"
              class="mr-2"
            />
            上传头像
          </ElButton>
        </ElUpload>
      </ElFormItem>
      <ElFormItem label="用户名" prop="name">
        <ElInput
          v-model="state.name"
          style="max-width: 20rem"
          placeholder="请输入用户名"
          class="mr-3"
        />
      </ElFormItem>
      <ElButton
        :disabled="!changedList.length"
        native-type="submit"
        style="margin-left: 80px"
        type="primary"
      >
        <UIcon name="i-tabler-checks" style="font-size: 18px" class="mr-2" />
        保存修改
      </ElButton>
      <ElDivider />
      <ElFormItem label="密码">
        <ElButton @click="handleChangePassword">
          <UIcon name="i-tabler-pencil" style="font-size: 16px" class="mr-2" />
          修改密码
        </ElButton>
      </ElFormItem>
    </ElForm>
  </UContainer>
</template>
