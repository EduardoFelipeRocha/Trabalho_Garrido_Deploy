FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY services/orders ./services/orders
COPY services/shared ./services/shared
EXPOSE 3002
CMD ["node", "services/orders/src/main/http-server.js"]
