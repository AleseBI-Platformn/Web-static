@echo off
echo ===========================================
echo  SERVIDOR PHP LOCAL - PRUEBA ARCHIVOS PHP
echo ===========================================
echo.
echo Iniciando servidor PHP para probar archivos PHP...
echo Carpeta: %cd%\public
echo URL: http://localhost:8080
echo.
echo Endpoints disponibles:
echo - Test:  http://localhost:8080/api/test.php
echo - Login: http://localhost:8080/api/login.php  
echo - Menus: http://localhost:8080/api/menus.php
echo.
echo Para detener, presiona Ctrl+C
echo ===========================================
echo.

cd public
php -S localhost:8080
