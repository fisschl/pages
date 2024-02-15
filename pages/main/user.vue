<script setup lang="ts">
import { first } from "lodash-es";
import { useUserStore } from "~/composables/user";
import { useFormState } from "~/utils/object";

const store = useUserStore();
await store.checkLogin();

const dialog = useFileDialog({ accept: "image/*" });
dialog.onChange(async (files) => {
  const file = first(files);
  if (!file) return;
  const { url, avatar } = await $fetch("/api/user/avatar", {
    method: "POST",
    body: { type: file.type, name: file.name },
  });
  await $fetch(url, {
    method: "PUT",
    body: file,
  });
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: { avatar },
  });
  store.user = res;
});

const { state } = useFormState(store.user);

const submit = async (key: string) => {
  const value = state[key];
  if (typeof value === "string") {
    state[key] = value.trim();
  }
  const res = await $fetch("/api/user", {
    method: "PUT",
    body: { [key]: state[key] },
  });
  store.user = res;
};

const isPasswordEditing = ref(false);
const handleEditPassword = () => {
  if (!state.value) return;
  state.password = "";
  isPasswordEditing.value = true;
};
</script>

<template>
  <UContainer class="py-6">
    <UForm v-if="state" :state="state" class="space-y-6">
      <UFormGroup label="用户名" name="name">
        <div class="flex gap-3">
          <UInput
            v-model="state.name"
            style="width: 12rem"
            placeholder="请输入用户名"
          />
          <UButton
            v-if="state.name !== store.user?.name"
            type="button"
            @click="submit('name')"
          >
            确认
          </UButton>
        </div>
      </UFormGroup>
      <UFormGroup label="头像" name="avatar">
        <div class="relative flex w-max">
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
      </UFormGroup>
      <UFormGroup label="密码" name="password">
        <div class="flex gap-3">
          <UInput
            v-model="state.password"
            style="width: 12rem"
            :disabled="!isPasswordEditing"
            type="password"
            placeholder="请输入密码"
          />
          <UButton
            v-if="!isPasswordEditing"
            type="button"
            @click="handleEditPassword"
          >
            修改密码
          </UButton>
          <UButton
            v-else-if="state.password"
            type="button"
            @click="submit('password')"
          >
            确认
          </UButton>
        </div>
      </UFormGroup>
      <UFormGroup label="角色" name="role">
        <div class="flex gap-3">
          <UInput v-model="state.role" style="width: 12rem" />
          <UButton
            v-if="state.role !== store.user?.role"
            type="button"
            @click="submit('role')"
          >
            确认
          </UButton>
        </div>
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
