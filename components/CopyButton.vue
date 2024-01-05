<script setup lang="ts">
const props = defineProps<{
  text?: string;
}>();

const { copied, copy } = useClipboard();

const handleCopy = () => {
  const { text } = props;
  if (!text) return;
  return copy(text);
};
</script>

<template>
  <UButton
    variant="link"
    size="xs"
    :icon="copied ? 'i-tabler-checks' : 'i-tabler-copy'"
    @click="handleCopy"
  />
</template>
