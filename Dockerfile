FROM registry.cn-shanghai.aliyuncs.com/fisschl/bun:latest AS builder
WORKDIR /root

COPY package.json .
COPY bun.lock .
COPY .npmrc .

RUN bun install --production

COPY prisma prisma

RUN bun run prisma generate

COPY . .

RUN bun run build

FROM registry.cn-shanghai.aliyuncs.com/fisschl/bun:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD bun ./server/index.mjs
