<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <Transition :enter-from-class="$style.enter" :leave-to-class="$style.enter">
    <div
      v-if="loading"
      class="z-30 bg-gray-100 p-2 shadow dark:bg-gray-800"
      :class="$style.loader"
    >
      <Icon
        name="i-tabler-loader"
        class="animate-spin"
        style="font-size: 18px"
      />
    </div>
  </Transition>
</template>

<style module>
.loader {
  position: fixed;
  left: 50%;
  top: 2rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 200ms;
  opacity: 1;
}

.loader.enter {
  top: 6px;
  opacity: 0;
}
</style>
