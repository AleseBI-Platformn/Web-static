@echo off
echo ========================================
echo ALESE CORP - Servidor PHP Local
echo ========================================
echo.

:: Verificar si PHP está instalado
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PHP no está instalado o no está en el PATH
    echo.
    echo Instala XAMPP o WAMP, o agrega PHP al PATH del sistema
    echo.
    pause
    exit /b 1
)

echo ✅ PHP detectado:
php --version | findstr /C:"PHP"
echo.

:: Mostrar configuración
echo 📋 Configuración del servidor:
echo    Puerto: 8000
echo    Directorio: %~dp0
echo    API URL: http://localhost:8000/api/
echo.

:: Verificar archivos API necesarios
echo 🔍 Verificando archivos API...
if not exist "api\config_dual.php" (
    echo ❌ Falta: api\config_dual.php
    echo.
    pause
    exit /b 1
)
if not exist "api\login_dual.php" (
    echo ❌ Falta: api\login_dual.php
    echo.
    pause
    exit /b 1
)
if not exist "api\menus_dual.php" (
    echo ❌ Falta: api\menus_dual.php
    echo.
    pause
    exit /b 1
)
if not exist "api\test_dual.php" (
    echo ❌ Falta: api\test_dual.php
    echo.
    pause
    exit /b 1
)

echo ✅ Archivos API encontrados
echo.

:: Lanzar servidor PHP
echo 🚀 Iniciando servidor PHP en puerto 8000...
echo.
echo Para probar la API, ve a:
echo http://localhost:8000/api/test_dual.php
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.
echo ========================================

:: Cambiar al directorio del script y lanzar servidor
cd /d "%~dp0"
php -S localhost:8000

echo.
echo Servidor detenido.
pause
