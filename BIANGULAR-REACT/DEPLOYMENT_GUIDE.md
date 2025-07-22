# ALESE CORP - Guía de Desarrollo y Producción

## 🎯 Configuración Dual (Local + Producción)

Este proyecto está configurado para funcionar tanto en desarrollo local como en producción (Bluehost) de manera automática.

## 🚀 Inicio Rápido - Desarrollo Local

### Opción 1: Servidor Completo (Recomendado)
```bash
# Doble click en:
start-full-dev.bat
```

### Opción 2: Manual
```bash
# Terminal 1 - Servidor PHP
start-php-server-dual.bat

# Terminal 2 - Frontend React
npm run dev
```

## 📋 URLs de Desarrollo

- **Frontend:** http://localhost:5173/
- **API Test:** http://localhost:8000/api/test_dual.php
- **Login API:** http://localhost:8000/api/login_dual.php
- **Menús API:** http://localhost:8000/api/menus_dual.php

## 🗂️ Estructura del Proyecto

```
proyecto/
├── api/                     # Backend PHP
│   ├── config_dual.php      # Configuración dual (local/prod)
│   ├── login_dual.php       # Autenticación
│   ├── menus_dual.php       # Obtener menús
│   └── test_dual.php        # Test de conexión
├── src/                     # Frontend React
│   ├── services/
│   │   └── aleseCorpApi_php_only.ts  # Cliente API
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   └── hooks/
│       └── useMenus.ts      # Hook para menús
├── .env                     # Variables de entorno
├── vite.config.ts           # Configuración Vite con proxy
└── start-full-dev.bat       # Launcher completo
```

## 🔧 Configuración de Base de Datos

### Local (XAMPP/WAMP)
```php
// En config_dual.php (automático)
DB_HOST = 'localhost'
DB_NAME = 'alese_corp'
DB_USER = 'root'
DB_PASS = ''
```

### Producción (Bluehost)
```php
// Editar en config_dual.php líneas 28-31
DB_HOST = 'localhost'
DB_NAME = 'tu_usuario_alese_corp'
DB_USER = 'tu_usuario_db'
DB_PASS = 'tu_password_real'
```

## 📊 Base de Datos Requerida

### Tabla `usuarios`
```sql
CREATE TABLE usuarios (
    UsuCod VARCHAR(50) PRIMARY KEY,
    UsuNom VARCHAR(100),
    UsuApePat VARCHAR(100),
    UsuApeMat VARCHAR(100),
    UsuEmail VARCHAR(100),
    UsuPassword VARCHAR(255),
    UsuPerfil INT,
    UsuEstado CHAR(1) DEFAULT '1'
);
```

### Tabla `menus`
```sql
CREATE TABLE menus (
    idmenu INT PRIMARY KEY,
    menu VARCHAR(100),
    vista VARCHAR(100),
    icono VARCHAR(50),
    estado CHAR(1) DEFAULT '1',
    url VARCHAR(200),
    ancho VARCHAR(20),
    alto VARCHAR(20),
    parent INT NULL
);
```

### Tabla `perfiles_menus`
```sql
CREATE TABLE perfiles_menus (
    idperfil INT,
    idmenu INT,
    PRIMARY KEY (idperfil, idmenu)
);
```

## 🌐 Detección Automática de Entorno

El sistema detecta automáticamente si está en local o producción:

**Local detectado cuando:**
- `HTTP_HOST` contiene 'localhost'
- `HTTP_HOST` contiene '127.0.0.1'
- No hay HTTPS

**Producción detectado cuando:**
- Cualquier otra condición
- Dominio real
- HTTPS presente

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Solo frontend
start-php-server-dual.bat # Solo PHP server  
start-full-dev.bat       # Todo junto

# Construcción
npm run build           # Build para producción
npm run preview         # Preview del build
```

## 📤 Subida a Producción (Bluehost)

### 1. Preparar Archivos
```bash
npm run build
```

### 2. Subir Archivos
- Subir carpeta `dist/` → directorio público de Bluehost
- Subir carpeta `api/` → directorio público de Bluehost
- Configurar base de datos en Bluehost

### 3. Configurar Producción
- Editar `api/config_dual.php` con datos reales de DB
- Cambiar URL en `.env` si es necesario

### 4. Verificar
- Visitar: `https://tu-dominio.com/api/test_dual.php`
- Debe mostrar conexión exitosa

## 🔍 Solución de Problemas

### Error: "Failed to resolve import"
```bash
# Verificar que los imports usen el nombre correcto:
import { aleseCorpApi } from '../services/aleseCorpApi_php_only';
```

### Error: PHP no encontrado
```bash
# Instalar XAMPP o agregar PHP al PATH
# Verificar: php --version
```

### Error: Base de datos
```bash
# 1. Verificar XAMPP/MySQL corriendo
# 2. Importar esquema de BD
# 3. Verificar usuarios de prueba
```

### Error: CORS
- Ya configurado automáticamente en `config_dual.php`
- Local: `http://localhost:5173`
- Producción: cambiar URL en config

## 👥 Datos de Prueba

### Usuario de prueba:
```sql
INSERT INTO usuarios VALUES (
    'admin', 'Administrador', 'Sistema', '', 
    'admin@alese.com', MD5('123456'), 1, '1'
);
```

### Menú de prueba:
```sql
INSERT INTO menus VALUES (1, 'Dashboard', 'dashboard', 'dashboard', '1', '/dashboard', NULL, NULL, NULL);
INSERT INTO perfiles_menus VALUES (1, 1);
```

## 📞 Soporte

Para problemas técnicos, verificar:
1. Logs de PHP en `error_log`
2. Console del navegador (F12)
3. Network tab para ver requests
4. Verificar configuración de entorno

---

**¡Listo para desarrollar! 🚀**
