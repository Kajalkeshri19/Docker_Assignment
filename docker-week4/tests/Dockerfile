FROM mcr.microsoft.com/playwright:v1.34.3-focal

WORKDIR /usr/src/tests

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["npm", "test"]
