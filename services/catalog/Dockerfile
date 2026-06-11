FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY services/catalog ./services/catalog
COPY services/shared ./services/shared
EXPOSE 3001
CMD ["node", "services/catalog/src/main/http-server.js"]
