@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Baja lo ultimo de GitHub y sube tus cambios (codigo, personajes, voces, PUBLICAR.txt). Los videos no se suben.
where git >nul 2>&1 || (echo Falta Git. Instalalo desde git-scm.com & goto fin)
echo === Bajando lo ultimo de GitHub... ===
git pull --rebase --autostash || (echo *** No se pudo bajar. Revisa el mensaje de arriba. *** & goto fin)
git add -A
git diff --cached --quiet && (echo Todo al dia: no hay cambios para subir. & goto fin)
echo.
git status --short
echo.
set MSG=
set /p MSG=Que cambiaste? (Enter = "Actualizar videos"):
if "%MSG%"=="" set MSG=Actualizar videos
git commit -q -m "%MSG%" || goto fin
echo === Subiendo a GitHub... ===
git push && echo LISTO: todo sincronizado.
:fin
pause
