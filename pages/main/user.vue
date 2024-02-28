<script setup lang="ts">
import { first } from "lodash-es";
import { useUserStore } from "~/composables/user";
import type { FormError } from "#ui/types";

const store = useUserStore();
await store.checkLogin();

const dialog = useFileDialog({ accept: "image/*" });
dialog.onChange(async (files) => {
  const file = first(files);
  if (!file) return;
  if (!store.user) return;
  const { url, avatar } = await $fetch("/api/user/avatar", {
    method: "POST",
    body: { type: file.type, name: file.name },
  });
  await $fetch(url, {
    method: "PUT",
    body: file,
  });
  store.user.avatar = avatar;
});

const state = reactive({
  name: store.user?.name,
  password: "******",
  role: store.user?.role,
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

const submit = async (key: keyof typeof state) => {
  const value = state[key];
  if (value) state[key] = value.trim();
  store.user = await $fetch("/api/user", {
    method: "PUT",
    body: { [key]: state[key] },
  });
};

const isPasswordEditing = ref(false);
const handleEditPassword = () => {
  state.password = "";
  isPasswordEditing.value = true;
};
</script>

<template>
  <UContainer class="py-6">
    <div class="relative mb-5 flex w-max">
      <UAvatar
        v-if="store.user?.avatar"
        size="2xl"
        :src="`https://cdn.fisschl.world/server/avatar/${store.user.avatar}`"
      />
      <UAvatar v-else size="2xl" icon="i-tabler-user" />
      <button
        title="更改头像"
        type="button"
        class="rounded-full bg-gray-700/40 transition"
        :class="$style.avatarButtonIcon"
        @click="dialog.open"
      >
        <UIcon name="i-tabler-edit" style="font-size: 1.2rem" />
      </button>
    </div>
    <UForm
      v-if="state"
      :validate="validate"
      :state="state"
      class="mb-5"
      @submit="submit('name')"
    >
      <UFormGroup label="用户名" name="name">
        <UInput
          v-model="state.name"
          style="width: 12rem"
          class="mr-4 inline-block"
          placeholder="请输入用户名"
        />
        <UButton v-if="state.name !== store.user?.name" type="submit">
          确认
        </UButton>
      </UFormGroup>
    </UForm>
    <UForm
      v-if="state"
      :validate="validate"
      :state="state"
      class="mb-5"
      @submit="submit('password')"
    >
      <UFormGroup label="密码" name="password">
        <UInput
          v-model="state.password"
          style="width: 12rem"
          :disabled="!isPasswordEditing"
          type="password"
          class="mr-4 inline-block"
          placeholder="请输入密码"
        />
        <UButton
          v-if="!isPasswordEditing"
          type="button"
          color="blue"
          @click="handleEditPassword"
        >
          修改密码
        </UButton>
        <UButton v-else-if="state.password" type="submit"> 确认 </UButton>
      </UFormGroup>
    </UForm>
    <UForm
      v-if="state"
      :validate="validate"
      :state="state"
      class="mb-5"
      @submit="submit('role')"
    >
      <UFormGroup v-if="store.user?.role === 'admin'" label="角色" name="role">
        <UInput
          v-model="state.role"
          class="mr-4 inline-block"
          style="width: 12rem"
        />
        <UButton v-if="state.role !== store.user?.role" type="submit">
          确认
        </UButton>
      </UFormGroup>
    </UForm>
  </UContainer>
</template>

<style module>
.avatarButtonIcon {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}
.avatarButtonIcon:hover {
  opacity: 1;
}
</style>
