FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY services/notifications ./services/notifications
COPY services/shared ./services/shared
EXPOSE 3003
CMD ["node", "services/notifications/src/main/http-server.js"]
