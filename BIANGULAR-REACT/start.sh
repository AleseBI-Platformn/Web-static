#!/bin/sh

echo "=============================================="
echo "🚀 INICIANDO ALESE CORP EN RENDER"
echo "=============================================="

# Crear directorios necesarios
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor
mkdir -p /var/run
mkdir -p /var/lib/nginx/tmp

# Permisos
chown -R nginx:nginx /var/www/html
chown -R nginx:nginx /var/lib/nginx
chown -R nginx:nginx /var/log/nginx

echo "✅ Directorios y permisos configurados"

# Validar archivos críticos
if [ ! -f "/var/www/html/index.html" ]; then
    echo "❌ ERROR: index.html no encontrado"
    exit 1
fi

if [ ! -d "/var/www/html/api" ]; then
    echo "❌ ERROR: Carpeta API no encontrada"
    exit 1
fi

echo "✅ Archivos validados"

# Mostrar información
echo "📊 Información del contenedor:"
echo "   - PHP Version: $(php -v | head -n 1)"
echo "   - Nginx Version: $(nginx -v 2>&1)"
echo "   - Working Directory: $(pwd)"
echo "   - Files in /var/www/html: $(ls -la /var/www/html | wc -l)"

echo "🌐 Configuración de red:"
echo "   - Puerto expuesto: 80"
echo "   - Frontend: / (React SPA)"
echo "   - Backend: /api/* (PHP)"

echo "🎯 Iniciando servicios con Supervisor..."

# Iniciar supervisor (gestiona PHP-FPM + Nginx)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
