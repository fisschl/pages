FROM node:latest AS builder
WORKDIR /root
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
COPY .npmrc .
COPY package.json .
RUN pnpm install --prod
COPY . .
RUN pnpm build

FROM node:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs
