FROM node:18-alpine

# Install git + dependencies
RUN apk add --no-cache git python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "backend/server.js"]
