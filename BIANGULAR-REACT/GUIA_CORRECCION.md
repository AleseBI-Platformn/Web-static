# 🔧 GUÍA DE CORRECCIÓN - Base de Datos ALESE CORP

## 📋 Problemas Identificados y Soluciones

### **1. Problemas en la Base de Datos:**
- ❌ Tabla con nombre problemático: `___________________________permisos`
- ❌ Estados inconsistentes en usuarios ('act'/'des' vs '1'/'0')
- ❌ Registros vacíos en permisos
- ❌ Falta de índices para optimizar consultas

### **2. Problemas en el Código:**
- ❌ Variable `permissions` no definida en useMenus.ts
- ❌ URL de API incorrecta (localhost)
- ❌ Manejo de errores insuficiente

## 🚀 Pasos para Implementar las Correcciones

### **PASO 1: Correcciones en la Base de Datos**
Ejecutar el archivo `database_fixes.sql` en tu base de datos MySQL:

```sql
-- Conectar a la base de datos y ejecutar:
mysql -h 50.31.188.163 -u xqkefqsh_user_ventas -p xqkefqsh_alesecorp_ventas < database_fixes.sql
```

O copiar y pegar el contenido del archivo en phpMyAdmin.

### **PASO 2: Configurar la URL del Servidor**
Editar el archivo `.env` y cambiar:
```
VITE_API_URL=https://TU-DOMINIO-REAL.com/api
```

Donde `TU-DOMINIO-REAL.com` es tu dominio real donde están alojados los archivos PHP.

### **PASO 3: Subir Archivos PHP al Servidor**
Subir todos los archivos de la carpeta `api/` a tu servidor web en la ruta `/api/`:
- config.php
- login.php (actualizado)
- menus.php
- login_improved.php (nuevo)
- test_database.php (para testing)

### **PASO 4: Probar la Conexión**
1. Visitar: `https://tu-dominio.com/api/test_database.php`
2. Verificar que aparezcan checkmarks verdes ✅
3. Probar login con usuarios existentes

### **PASO 5: Configurar CORS (si es necesario)**
Si tienes problemas de CORS, agregar al .htaccess del servidor:
```apache
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET,POST,OPTIONS,DELETE,PUT"
Header always set Access-Control-Allow-Headers "Content-Type,Authorization"
```

## 🧪 Testing

### **Usuarios de Prueba Disponibles:**
| Usuario | Contraseña | Perfil |
|---------|------------|--------|
| jpoma | jpoma2023 | Administrador |
| cvasquez | cvasquez2024 | Gerente |
| clagos | clagos5263 | Retomas |

### **URLs de Test:**
- Test de DB: `https://tu-dominio.com/api/test_database.php`
- Login: `https://tu-dominio.com/api/login.php`
- Menús: `https://tu-dominio.com/api/menus.php?permissions=1,2,3`

## 📊 Verificaciones Post-Implementación

✅ **Base de Datos:**
- Tabla `usuario_permisos` existe
- Estados de usuarios son '1' o '0'
- No hay registros vacíos en permisos
- Índices creados correctamente

✅ **API:**
- Login funciona correctamente
- Menús se cargan según permisos
- Errores se manejan adecuadamente

✅ **Frontend:**
- Variable `permissions` definida correctamente
- URLs apuntan al servidor real
- Manejo de errores mejorado

## 🔍 Monitoreo

### **Logs a Revisar:**
- Error logs del servidor web
- Logs de acceso de la aplicación
- Console logs del navegador

### **Métricas a Verificar:**
- Tiempo de respuesta de la API
- Tasa de éxito de logins
- Número de menús cargados por usuario

## 📞 Soporte

Si hay problemas después de implementar estas correcciones:

1. **Verificar logs del servidor**
2. **Revisar permisos de archivos PHP**
3. **Confirmar configuración de base de datos**
4. **Testear con usuarios conocidos**

## 🚨 Notas Importantes

- ⚠️ **Backup:** Hacer backup de la base de datos antes de ejecutar correcciones
- ⚠️ **Testing:** Probar en entorno de desarrollo primero
- ⚠️ **SSL:** Asegurar que el servidor use HTTPS para producción
- ⚠️ **Seguridad:** Cambiar contraseñas por defecto después del testing
