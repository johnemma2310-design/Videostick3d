@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo === Y si el Sol se apaga (Sticky): render del short ===
where node >nul 2>&1 || (echo Falta Node.js. Instalalo desde nodejs.org & goto fin)
where ffmpeg >nul 2>&1 || (echo Falta ffmpeg. & goto fin)
where python >nul 2>&1 || (echo Falta Python 3. & goto fin)
if not exist node_modules (echo Instalando dependencias... & call npm install || goto error)
if not exist out mkdir out
if not exist publicoz.wav (echo Falta publicoz.wav: corre python -I voz/tts.py dentro de voz y conviertelo. & goto fin)
echo [1/4] Animacion (puede tardar varios minutos)...
call npx remotion render src/index.ts SolApagado out/video_mudo.mp4 --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000 || goto error
echo [2/4] Sonido...
python -I audio/mezcla.py public/voz.wav out/mezcla.wav || goto error
echo [3/4] Uniendo imagen y sonido...
ffmpeg -v error -y -i out/video_mudo.mp4 -i out/mezcla.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "out/Sol_Apagado_sin_subs.mp4" || goto error
echo [4/4] Subtitulos...
python -I subtitulos.py voz/palabras.json out/Sol_Apagado_sin_subs.mp4 Sol_Apagado_Sticky.mp4 || goto error
echo.
echo LISTO: "%~dp0Sol_Apagado_Sticky.mp4"
goto fin
:error
echo.
echo *** Algo fallo. Revisa el mensaje de arriba. ***
:fin
pause
