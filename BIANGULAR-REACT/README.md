# ALESE CORP - Portal Empresarial

## 🚀 Pasos para Ejecutar el Proyecto Local

### **Requisitos:**
- Node.js instalado
- PHP instalado
- Terminal/PowerShell

### **Paso 1: Instalar Dependencias (Solo la primera vez)**
```bash
# En la carpeta raíz
cd "c:\Users\ALEXANDER.CASTILLO\OneDrive - ALESE SAC\Escritorio\KIWIPAY\JPOMA-BIALESE\Web-static"
npm install

# En la carpeta del frontend
cd "c:\Users\ALEXANDER.CASTILLO\OneDrive - ALESE SAC\Escritorio\KIWIPAY\JPOMA-BIALESE\Web-static\BIANGULAR-REACT"
npm install
```

### **Paso 2: Ejecutar el Proyecto (2 terminales)**

#### **Terminal 1 - Servidor PHP (Puerto 8000)**
```bash
cd "c:\Users\ALEXANDER.CASTILLO\OneDrive - ALESE SAC\Escritorio\KIWIPAY\JPOMA-BIALESE\Web-static\BIANGULAR-REACT\api"; php -S localhost:8000
```

#### **Terminal 2 - Frontend React (Puerto 5173)**
```bash
cd "c:\Users\ALEXANDER.CASTILLO\OneDrive - ALESE SAC\Escritorio\KIWIPAY\JPOMA-BIALESE\Web-static\BIANGULAR-REACT"
npm run dev
```

### **Paso 3: Abrir en el Navegador**
- **Frontend:** http://localhost:5173
- **Test API:** http://localhost:8000/test_dual.php

---

## 📋 Credenciales de Prueba
- **Usuario:** `admin` o `jpoma`
- **Contraseña:** `123456` o `jpoma2023`

---

## 🔧 Comandos Útiles

### **Reiniciar Servidores:**
```bash
# Si hay problemas, detener con Ctrl+C y reiniciar ambos comandos
```

### **Verificar que todo funciona:**
- **Verificar PHP:** http://localhost:8000/test_dual.php
- **Verificar Frontend:** http://localhost:5173

---

## ✅ **Estado del Sistema**
- **✅ Login funcionando** - Autenticación exitosa
- **✅ APIs funcionando** - Todas las APIs responden correctamente
- **✅ Menús cargados** - 52 menús en 8 categorías principales
- **✅ Base de datos conectada** - 55 usuarios, 93 menús, 5 tablas

---

**¡Listo para usar! 🎉**

### **Menús Disponibles:**
- **GERENCIA** (2 reportes)
- **VENTAS** (10 reportes) 
- **DIGITAL** (3 reportes)
- **RETOMAS** (4 reportes)
- **ADMINISTRACION** (2 reportes)
- **POSTVENTA** (4 reportes)
- **F&I** (sin reportes)
- **KPI** (14 reportes)
