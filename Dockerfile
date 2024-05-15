FROM registry.cn-shanghai.aliyuncs.com/fisschl/pnpm:latest AS builder
WORKDIR /root
COPY .npmrc .
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --prod
COPY prisma prisma
RUN pnpm prisma generate
COPY . .
RUN pnpm build

FROM registry.cn-shanghai.aliyuncs.com/fisschl/node:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs
