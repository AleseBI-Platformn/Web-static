# ============================================
# DOCKERFILE PARA RENDER - ALESE CORP
# 1 Solo Web Service: React + PHP + Nginx
# ============================================

# ============================================
# STAGE 1: Build Frontend React
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente del frontend
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY .env.production ./

# Build de producción
ENV NODE_ENV=production
RUN npm run build

# ============================================
# STAGE 2: Servidor de Producción
# PHP-FPM + Nginx + React Built
# ============================================
FROM php:8.1-fpm-alpine

# Instalar dependencias
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    curl \
    && docker-php-ext-install pdo pdo_mysql

# Crear usuario nginx
RUN adduser -D -s /bin/sh nginx

# Configurar directorios
WORKDIR /var/www/html

# Copiar API PHP
COPY api/ ./api/
RUN chmod -R 755 ./api/

# Copiar build del frontend desde stage 1
COPY --from=frontend-builder /app/dist ./

# Configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Configuración de Supervisor (gestiona PHP-FPM + Nginx)
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Permisos
RUN chown -R nginx:nginx /var/www/html
RUN chown -R nginx:nginx /var/lib/nginx

# Puerto que expondrá Render
EXPOSE 80

# Comando de inicio
CMD ["/start.sh"]
