@echo off
echo ===========================================
echo  ALESE CORP - DESARROLLO COMPLETO
echo ===========================================
echo.
echo Iniciando servidor API (puerto 3001)...
start cmd /k "cd server && npm start"

timeout /t 3 /nobreak > nul

echo Iniciando frontend Vite (puerto 5173)...
echo.
echo URLs disponibles:
echo - Frontend: http://localhost:5173
echo - API:      http://localhost:3001
echo - Test:     http://localhost:3001/api/test
echo.
echo ===========================================

npm run dev
