<script setup lang="ts">
import { useChat } from "@ai-sdk/vue";

const { messages, input, handleSubmit } = useChat();

const formState = reactive({
  input,
});
</script>

<template>
  <UContainer as="main" class="flex h-screen flex-col">
    <ol class="flex-1 overflow-y-auto">
      <li v-for="message in messages" :key="message.id">
        <div v-if="message.role === 'user'">用户</div>
        <div v-else-if="message.role === 'assistant'">助手</div>
        <div v-for="(part, index) in message.parts" :key="index">
          <template v-if="part.type === 'text'">
            {{ part.text }}
          </template>
        </div>
      </li>
    </ol>
    <UForm :state="formState" class="flex" @submit="handleSubmit">
      <UFormField name="input">
        <UInput v-model="formState.input" placeholder="Say something..." />
      </UFormField>
      <UButton type="submit"> Send </UButton>
    </UForm>
  </UContainer>
</template>
