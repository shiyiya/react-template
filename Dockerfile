FROM node:stable AS builder
WORKDIR /app
COPY package.json ./
RUN pnpm install --registry=https://registry.npmmirror.com
COPY . .
ARG APP_ENV
ENV APP_ENV=${APP_ENV}
RUN pnpm run build

FROM nginx:stable AS runner
WORKDIR /app
COPY --from=builder /app/dist /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY default.conf /etc/nginx/nginx.conf
EXPOSE 80
