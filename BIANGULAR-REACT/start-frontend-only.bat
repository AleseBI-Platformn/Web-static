@echo off
echo ========================================
echo ALESE CORP - Solo Frontend (sin PHP)
echo ========================================
echo.

:: Cambiar al directorio del script
cd /d "%~dp0"
echo 📁 Directorio: %cd%
echo.

:: Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO encontrado
    echo.
    echo 📥 Instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado:
node --version
npm --version
echo.

:: Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
    echo.
)

echo 🌐 Iniciando frontend...
echo.
echo 📋 URL: http://localhost:5173/
echo.
echo ⚠️  NOTA: El login NO funcionará sin servidor PHP
echo    Para instalar PHP, usa XAMPP desde:
echo    https://www.apachefriends.org/
echo.

:: Iniciar Vite
npm run dev

echo.
echo 🛑 Frontend detenido.
pause
