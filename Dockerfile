FROM node:21 AS builder
WORKDIR /root
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
COPY .npmrc .
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --prod
COPY . .
RUN pnpm build

FROM node:21
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs