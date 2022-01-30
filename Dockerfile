FROM node:14.18.3-bullseye AS builder

WORKDIR /app
RUN yarn global add cross-env
COPY . .
RUN yarn global add libvips
RUN yarn
RUN yarn build:umbrel
RUN ls -lah /app

FROM node:14.18.3-bullseye
WORKDIR /app
COPY --from=builder /app .
CMD ["yarn", "start"]
