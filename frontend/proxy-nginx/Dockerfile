# FROM node:lts-alpine AS builder
# WORKDIR /app
# COPY frontend/package*.json ./
# RUN npm install
# COPY frontend/ .
# RUN npm run build

# FROM nginx:stable

# COPY --from=builder /app/dist /usr/share/nginx/html

# COPY frontend/proxy-nginx/nginx.conf /etc/nginx/conf.d/default.conf



FROM node:lts-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:stable
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/proxy-nginx/nginx.conf /etc/nginx/conf.d/default.conf
