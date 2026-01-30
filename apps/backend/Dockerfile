
FROM node:20-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist ./dist

# Note: firebase-service-account.json is mounted via docker-compose volumes
# This keeps sensitive credentials out of the Docker image

CMD ["node", "dist/main"]
