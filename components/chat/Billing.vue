<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/chat/billing", { headers });

const today_data = computed(() => {
  if (!data.value) return;
  const { usage, residual } = data.value.today;
  const per = ((usage / residual) * 100).toFixed(0);
  return {
    detail: `${usage}/${residual}`,
    percent: `(${per}%)`,
  };
});
</script>

<template>
  <div>
    <UButton color="gray">
      <span> 今日使用 </span>
      <span class="mr-1">
        {{ today_data?.detail }}
      </span>
      <span>
        {{ today_data?.percent }}
      </span>
    </UButton>
  </div>
</template>
