@echo off
REM Script de inicio automático para MedicFamily
REM Ejecuta: setup_database.py y levanta los servidores

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    MEDICFAMILY - STARTUP AUTOMATICO
echo ================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend" (
    echo ERROR: No se encontro la carpeta 'backend'
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Paso 1: Ejecutar setup_database.py
echo [1/3] Configurando base de datos...
echo.
python setup_database.py

if errorlevel 1 (
    echo ERROR: Fallo la configuracion de BD
    pause
    exit /b 1
)

echo.
echo ================================================
echo    INICIANDO SERVIDORES
echo ================================================
echo.

REM Paso 2: Iniciar Django en background
echo [2/3] Iniciando Django Backend...
cd backend
start "Django Backend - MedicFamily" cmd /k python manage.py runserver
cd ..

timeout /t 2 /nobreak

REM Paso 3: Iniciar React en background
echo [3/3] Iniciando React Frontend...
cd frontend
start "React Frontend - MedicFamily" cmd /k npm start
cd ..

echo.
echo ================================================
echo    ✅ SISTEMA INICIADO
echo ================================================
echo.
echo Abriendo en navegador...
timeout /t 3 /nobreak

REM Abrir en el navegador
start http://localhost:3000/login

echo.
echo ================================================
echo    📋 INFORMACION IMPORTANTE
echo ================================================
echo.
echo USUARIO DE PRUEBA:
echo   Email: doctor@test.com
echo   Password: TestPassword123
echo.
echo URLS:
echo   Frontend: http://localhost:3000
echo   Backend Admin: http://localhost:8000/admin
echo   API: http://localhost:8000/api
echo.
echo LOGS:
echo   Abre DevTools con F12 en el navegador
echo   Terminal del backend: Verás logs con emojis
echo.
echo Para detener los servidores:
echo   Cierra ambas ventanas de terminal
echo.
pause
