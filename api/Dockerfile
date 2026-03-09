FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
