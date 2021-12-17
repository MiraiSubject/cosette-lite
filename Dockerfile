FROM node:lts-alpine
RUN apk add --no-cache git yarn
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
COPY . /app
RUN yarn build
EXPOSE 8000
CMD ["yarn", "start"]
