FROM node:21
WORKDIR /root
COPY .output .
CMD node ./server/index.mjs
