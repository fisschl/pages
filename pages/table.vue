<script setup lang="ts">
const people = [
  // 生成20个假数据
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 9,
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "xxxxxxx.com",
    role: "Member",
  })),
];
</script>

<template>
  <UTable class="m-4" :rows="people" />
</template>
