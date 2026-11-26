@echo off
rem Vigila el ultimo video largo del canal. Cuando alguien comenta, pone su foto y nombre en el cameo
rem y vuelve a renderizar el short (por defecto gravedad). Revisa cada 20 minutos. Sin IA.
rem Uso: VIGILAR_CAMEO.bat [video]
setlocal
cd /d "%~dp0"
set V=%1
if "%V%"=="" set V=gravedad
:otra
echo [%time:~0,5%] Revisando comentarios del video largo...
python -I scripts/cameo.py largo
if %errorlevel%==0 goto render
if %errorlevel%==3 (ping -n 1201 127.0.0.1 >nul & goto otra)
echo Error al consultar YouTube. Reintento en 20 minutos.
ping -n 1201 127.0.0.1 >nul
goto otra
:render
echo Hay ganador. Renderizando %V% con su cameo...
call RENDERIZAR.bat %V% < nul
echo CAMEO LISTO
endlocal
