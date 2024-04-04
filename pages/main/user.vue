<script setup lang="ts">
import type {
  FormInstance,
  FormRules,
  UploadRequestHandler,
} from "element-plus";
import { pick } from "lodash-es";
import { useUserStore } from "~/composables/user";

const store = useUserStore();
await store.checkLogin();

const form = ref<FormInstance>();

const state = reactive({
  name: store.user?.name,
});

const rules = reactive<FormRules<typeof state>>({
  name: [{ required: true, message: "请输入用户名" }],
});

const changedProps = reactive(new Set<keyof typeof state>());

const submit = async () => {
  await form.value?.validate();
  if (!changedProps.size) return;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: pick(state, Array.from(changedProps)),
  });
  store.user = res;
  changedProps.clear();
};

const handleUpload: UploadRequestHandler = async ({ file }) => {
  if (!store.user) return;
  if (store.user.avatar) {
    await $fetch("/api/oss/delete", {
      method: "DELETE",
      query: { key: store.user.avatar },
    });
  }
  const key = `home/${store.user.id}/avatar/${file.name}`;
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: { avatar: key },
  });
  await upload_file(key, file);
  store.user.avatar = res.avatar;
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
      @submit.prevent="submit"
    >
      <ElFormItem label="头像">
        <ElAvatar :src="store.avatar" size="large" class="mr-3" />
        <ElUpload
          accept="image/*"
          :show-file-list="false"
          :http-request="handleUpload"
        >
          <ElButton circle>
            <UIcon name="i-tabler-pencil" style="font-size: 16px" />
          </ElButton>
        </ElUpload>
      </ElFormItem>
      <ElFormItem label="用户名" prop="name">
        <ElInput
          v-model="state.name"
          style="max-width: 20rem"
          placeholder="请输入用户名"
          class="mr-3"
          @change="changedProps.add('name')"
        />
      </ElFormItem>
      <ElFormItem label="密码">
        <ElButton circle @click="handleChangePassword">
          <UIcon name="i-tabler-pencil" style="font-size: 16px" />
        </ElButton>
      </ElFormItem>
      <ElButton native-type="submit" style="margin-left: 80px" type="primary">
        <UIcon name="i-tabler-checks" style="font-size: 18px" class="mr-2" />
        保 存
      </ElButton>
    </ElForm>
  </UContainer>
</template>
