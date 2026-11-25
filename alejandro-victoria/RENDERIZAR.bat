@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo === Alejandro en Gaugamela: render del short ===
where node >nul 2>&1 || (echo Falta Node.js. Instalalo desde nodejs.org & goto fin)
where ffmpeg >nul 2>&1 || (echo Falta ffmpeg. & goto fin)
where python >nul 2>&1 || (echo Falta Python 3. & goto fin)
if not exist node_modules (echo Instalando dependencias... & call npm install || goto error)
if not exist out mkdir out
echo [1/3] Animacion (puede tardar varios minutos)...
call npx remotion render src/index.ts AlejandroVictoria out/video_mudo.mp4 --codec h264 --crf 16 --gl=angle --concurrency=2 --timeout=240000 || goto error
echo [2/3] Sonido...
python -I audio/sonido.py out/sonido.wav || goto error
echo [3/3] Uniendo imagen y sonido...
ffmpeg -v error -y -i out/video_mudo.mp4 -i out/sonido.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "Alejandro_Gaugamela.mp4" || goto error
echo.
echo LISTO: "%~dp0Alejandro_Gaugamela.mp4"
goto fin
:error
echo.
echo *** Algo fallo. Revisa el mensaje de arriba. ***
:fin
pause
