# ============================================
# CONFIGURACIÓN RENDER PARA DOCKER
# ============================================

# En Render Dashboard, configura:

Name: Web-static
Language: Docker ✅ (Correcto)
Branch: staging ✅ (Correcto)

# ❌ CAMBIAR ESTOS CAMPOS:
Root Directory: ./ (no "dist")
Build Command: (dejar VACÍO - Docker lo maneja)
Start Command: (dejar VACÍO - Docker lo maneja)

# ✅ Variables de entorno necesarias:
NODE_ENV=production
VITE_API_MODE=production  
VITE_API_BASE_URL=/api

# ============================================
# RENDER DETECTARÁ AUTOMÁTICAMENTE:
# ============================================
# - Dockerfile en la raíz
# - Puerto 80 expuesto
# - CMD ["/start.sh"] como comando de inicio
