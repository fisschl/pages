import { $ } from "bun";

const image = "registry.cn-shanghai.aliyuncs.com/fisschl/pages:latest";

await $`docker build -t ${image} .`;
await $`docker push ${image}`;
