FROM node:latest AS builder
WORKDIR /root
COPY .npmrc .
RUN npm install -g pnpm
COPY package.json .
RUN pnpm install --prod
COPY . .
RUN pnpm build

FROM node:latest
WORKDIR /root
COPY --from=builder /root/.output .
CMD node ./server/index.mjs
