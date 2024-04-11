FROM registry.cn-shanghai.aliyuncs.com/fisschl/pnpm:latest AS builder
WORKDIR /root
COPY .npmrc .
COPY package.json .
COPY prisma prisma
RUN pnpm install --prod && pnpm prisma generate
COPY . .
RUN pnpm build

FROM registry.cn-shanghai.aliyuncs.com/fisschl/pnpm:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs
