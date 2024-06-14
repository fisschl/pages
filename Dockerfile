FROM registry.cn-shanghai.aliyuncs.com/fisschl/node:latest AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm

WORKDIR /root

COPY pnpm-lock.yaml .
COPY package.json .
COPY .npmrc .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

COPY prisma prisma

RUN pnpm prisma generate

COPY . .

RUN pnpm build

FROM registry.cn-shanghai.aliyuncs.com/fisschl/node:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs
