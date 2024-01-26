<script setup lang="ts">
import type { FormError } from "#ui/types";

const state = reactive({
  url: "",
});

const validate = () => {
  const errors: FormError[] = [];
  if (!state.url.trim()) errors.push({ path: "url", message: "必填" });
  return errors;
};

const result = ref("");
const { copied, copy } = useClipboard();

const onSubmit = async () => {
  const { url } = await $fetch("/api/short_link", {
    method: "POST",
    body: state,
  });
  result.value = url;
  await copy(url);
};
</script>

<template>
  <UContainer as="article" class="py-6">
    <UForm
      :state="state"
      :validate="validate"
      class="mb-6 mt-4 space-y-4"
      @submit="onSubmit"
    >
      <UFormGroup label="链接" name="url">
        <UInput
          v-model="state.url"
          size="lg"
          placeholder="请输入原链接"
          class="flex-1"
        />
      </UFormGroup>
      <div class="flex justify-end">
        <UButton
          type="submit"
          class="px-10"
          :icon="copied ? 'i-tabler-checks' : undefined"
        >
          创建短链接
        </UButton>
      </div>
    </UForm>
    <article v-if="result" class="flex justify-center">
      <p class="rounded bg-gray-100 px-4 py-2 dark:bg-gray-900">{{ result }}</p>
    </article>
  </UContainer>
</template>
