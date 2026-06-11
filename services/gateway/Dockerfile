FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY services/gateway ./services/gateway
EXPOSE 3000
CMD ["node", "services/gateway/src/main/http-server.js"]
