FROM node:16-alpine

ENV PORT=80
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY src ./src 
COPY tsconfig.json .

RUN npm run build && npm prune --production && rm -rf ./src

CMD ["npm", "start"]
