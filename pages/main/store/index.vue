<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import { baseName, useOssStore } from "~/composables/oss";

const user = useUserStore();
await user.checkLogin();

const oss = useOssStore();
const prefix = `home/${user.user?.id}/store`;

const path = ref("/");
const links = ref<Record<string, string>[]>([]);

const fetchList = async () => {
  const res = await oss.list_dir(prefix + path.value);
  const prefixes = res.prefixes.map((item) => {
    return {
      label: baseName(item),
      icon: "i-tabler-folder",
    };
  });
  const files = res.objects.map((item) => {
    return {
      label: baseName(item.name),
      icon: "i-tabler-file",
    };
  });
  links.value = [...prefixes, ...files];
};

onMounted(async () => {
  await oss.init();
  await fetchList();
});

const router = useRouter();

const handleUpload = async () => {
  await router.push({
    path: "/main/store/upload",
    query: {
      prefix,
      path: path.value,
    },
  });
};
</script>

<template>
  <UContainer class="py-6">
    <div class="mb-3">
      <UButton title="上传" @click="handleUpload">
        <UIcon name="i-tabler-plus" style="font-size: 1.2rem" />
      </UButton>
    </div>
    <UVerticalNavigation :links="links"> </UVerticalNavigation>
  </UContainer>
</template>

<style module></style>
