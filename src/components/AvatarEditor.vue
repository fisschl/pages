<script setup lang="ts">
import { inputAvatar } from "@/utils/avatar";

const model = defineModel<string>();
const emit = defineEmits<{
  change: [string];
}>();

const handleSelectImg = async () => {
  const url = await inputAvatar();
  if (!url) return;
  model.value = url;
  emit("change", model.value);
};
</script>

<template>
  <div>
    <img v-if="modelValue" class="avatar-view" :src="modelValue" alt="avatar" />
    <VBtn @click="handleSelectImg"> 上传头像 </VBtn>
  </div>
</template>

<style scoped>
.avatar-view {
  display: inline-block;
  vertical-align: middle;
  border-radius: 50%;
  width: 3rem;
  margin-right: 1rem;
}
</style>
