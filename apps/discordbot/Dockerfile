FROM node:lts-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm i -g pnpm turbo
COPY . /app
RUN turbo prune --scope=discordbot --docker

FROM builder AS dependencies
# First install the dependencies (as they change less often)
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
COPY --from=builder /app/out/full/ /app


FROM node:lts-alpine as runner
WORKDIR /app
COPY --from=dependencies /app .
RUN npm i -g pnpm
COPY --from=dependencies . /app
WORKDIR /app/apps/discordbot
VOLUME [ "/tmp/gg.mirai.oth.discordbot-api.sock" ]
CMD ["pnpm", "start"]