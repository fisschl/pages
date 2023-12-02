<script setup lang="ts">
import type { NuxtLink } from "#build/components";
import { formatDistanceToNowStrict, parseJSON } from "date-fns/esm";
import { zhCN } from "date-fns/esm/locale";
import { pick } from "lodash-es";
import type { Hit } from "meilisearch";
import type { ArticleSearchResult } from "~/server/api/articles";

const props = defineProps<{
  item: Hit<ArticleSearchResult>;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const to = computed(() => ({
  path: "/editor",
  query: pick(props.item, "id"),
}));

const updateTime = computed(() => {
  return formatDistanceToNowStrict(parseJSON(props.item.update_time), {
    locale: zhCN,
    addSuffix: true,
  });
});

const actions = [
  [
    {
      label: "删除",
      icon: "i-tabler-trash",
      click: async () => {
        await $fetch("/api/article", {
          method: "DELETE",
          query: pick(props.item, "id"),
        });
        emit("delete");
      },
    },
  ],
];
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2 rounded px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900"
  >
    <p class="mr-2 truncate" :class="$style.title">
      {{ item.name }}
    </p>
    <p
      :class="$style.hightlightAble"
      class="mr-2 flex-1 truncate text-sm text-gray-400 dark:text-gray-500"
      v-html="item._formatted?.body"
    ></p>
    <UIcon
      v-if="item.shared"
      name="i-tabler-share"
      class="mr-2 text-blue-500"
      title="已共享"
    />
    <span class="mr-2 text-sm text-gray-500 dark:text-gray-400">
      {{ updateTime }}
    </span>
    <UDropdown mode="hover" :items="actions">
      <UButton
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-tabler-dots"
        @click.prevent
      />
    </UDropdown>
  </NuxtLink>
</template>

<style module>
.hightlightAble em {
  font-style: normal;
  color: #167df0;
}

.title {
  max-width: 50%;
}
</style>
