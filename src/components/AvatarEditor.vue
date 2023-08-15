<script setup lang="ts">
import { inputAvatar } from "@/utils/avatar";

const props = defineProps<{
  modelValue: string | undefined;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();

const modelValue = useVModel(props, "modelValue", emit);

const handleSelectImg = async () => {
  const url = await inputAvatar();
  if (!url) return;
  modelValue.value = url;
  emit("change", modelValue.value);
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
