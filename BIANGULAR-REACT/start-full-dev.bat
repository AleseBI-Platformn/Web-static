@echo off
setlocal enabledelayedexpansion

echo ========================================
echo ALESE CORP - Desarrollo Completo
echo ========================================
echo.

:: Cambiar al directorio del script
cd /d "%~dp0"
echo 📁 Directorio actual: %cd%
echo.

:: Verificar Node.js primero
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO encontrado
    echo.
    echo 📥 Necesitas instalar Node.js desde:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado:
    node --version
)
echo.

:: Verificar npm
echo 🔍 Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm NO encontrado
    pause
    exit /b 1
) else (
    echo ✅ npm encontrado:
    npm --version
)
echo.

:: Verificar dependencias
if not exist "node_modules" (
    echo 📦 Instalando dependencias de Node.js...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
    echo.
)

:: Verificar PHP
echo 🔍 Verificando PHP...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PHP NO encontrado en el PATH
    echo.
    echo 📋 OPCIONES para instalar PHP:
    echo.
    echo 1. XAMPP (Recomendado para Windows):
    echo    - Descargar de: https://www.apachefriends.org/
    echo    - Instalar y agregar C:\xampp\php al PATH
    echo.
    echo 2. WAMP:
    echo    - Descargar de: https://www.wampserver.com/
    echo.
    echo 3. PHP standalone:
    echo    - Descargar de: https://windows.php.net/download/
    echo.
    echo ⚠️  Por ahora, solo iniciaremos el frontend
    echo    Instala PHP para tener el backend funcionando
    echo.
    
    set /p "continuar=¿Continuar solo con frontend? (s/n): "
    if /i "!continuar!" neq "s" (
        echo Operación cancelada
        pause
        exit /b 1
    )
    
    echo.
    echo 🌐 Iniciando solo el frontend...
    echo    URL: http://localhost:5173/
    echo.
    echo ⚠️  El login NO funcionará sin el servidor PHP
    echo.
    npm run dev
    
) else (
    echo ✅ PHP encontrado:
    php --version | findstr /C:"PHP"
    echo.
    
    :: Verificar archivos API
    echo 🔍 Verificando archivos API...
    if not exist "api\config_dual.php" (
        echo ❌ Falta: api\config_dual.php
        pause
        exit /b 1
    )
    if not exist "api\login_dual.php" (
        echo ❌ Falta: api\login_dual.php
        pause
        exit /b 1
    )
    
    echo ✅ Archivos API encontrados
    echo.
    
    echo 🚀 Iniciando AMBOS servidores...
    echo.
    echo 📋 URLs importantes:
    echo    Frontend: http://localhost:5173/
    echo    API Test: http://localhost:8000/api/test_dual.php
    echo.
    
    :: Iniciar PHP en segundo plano
    echo 🔧 Iniciando servidor PHP (puerto 8000)...
    start /min "PHP Server" cmd /c "php -S localhost:8000"
    
    :: Esperar un poco
    timeout /t 3 /nobreak >nul
    
    :: Iniciar Vite
    echo 🌐 Iniciando Vite (Frontend)...
    echo.
    npm run dev
)

echo.
echo 🛑 Desarrollo detenido.
pause
