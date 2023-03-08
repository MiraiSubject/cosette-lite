# Prepare turborepo
FROM node:lts-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm turbo


FROM base as pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=webstack --docker

FROM base AS installer
# First install the dependencies (as they change less often)
WORKDIR /app
COPY .gitignore .gitignore
# COPY ./apps/webstack/.npmrc .npmrc
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the server
FROM base as builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app .
RUN turbo build --scope=webstack


FROM builder as runner
ENV PORT 8000
WORKDIR /app/apps/webstack
VOLUME [ "/tmp/gg.mirai.oth.discordbot-api.sock" ]
CMD ["pnpm", "start"]
