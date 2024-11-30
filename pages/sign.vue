<script setup lang="ts">
const handleSignUp = async () => {
  await signUp.email({
    email: "email@domain.com",
    name: "Test User",
    password: "password1234",
    username: "test",
  });
};

const handleLogin = async () => {
  await signIn.username({
    username: "test",
    password: "password1234",
  });
};

const { data: session } = await useSession();
</script>

<template>
  <main class="p-8">
    <div class="mb-3 flex gap-3">
      <UButton v-if="!session" @click="handleSignUp"> 注 册 </UButton>
      <UButton v-if="!session" @click="handleLogin"> 登 录 </UButton>
    </div>
    <div>
      <pre>{{ session }}</pre>
    </div>
  </main>
</template>

<style scoped></style>
