FROM node:lts-alpine
RUN apk add --no-cache build-base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]