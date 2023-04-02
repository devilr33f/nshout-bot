FROM node:19-alpine AS build

WORKDIR /app

COPY ["package.json", "yarn.lock*", "./"]

RUN npm install

ADD . .

RUN npm run build

FROM node:19-alpine AS production

WORKDIR /app

COPY ["package.json", "yarn.lock*", "./"]

RUN npm install --omit=dev --ignore-scripts

COPY --from=BUILD /app/dist dist

CMD [ "npm", "run", "start" ]
