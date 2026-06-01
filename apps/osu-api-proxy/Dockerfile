FROM node:24-alpine

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

WORKDIR /app

COPY apps/osu-api-proxy/package.json ./
COPY apps/osu-api-proxy/src ./src

EXPOSE 8787

CMD ["node", "src/server.js"]
