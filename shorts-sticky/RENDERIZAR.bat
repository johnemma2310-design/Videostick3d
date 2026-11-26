@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
rem Uso:  RENDERIZAR.bat apagon | luna | rotacion | musculo
rem Los videos con H=1 son horizontales (1920x1080): llevan el cierre horizontal out\outro_final_h.mp4 (composicion OutroH).
rem Deja el video final (con subtitulos y cierre "suscribete") en la carpeta del video, al lado de su PUBLICAR.txt.
set V=%1
set H=
if "%V%"=="" (echo Uso: RENDERIZAR.bat apagon ^| luna ^| rotacion ^| musculo & goto fin)
if /i "%V%"=="apagon"   (set COMP=Apagon& set CARPETA=Apagon mundial - Las primeras 72 horas)
if /i "%V%"=="luna"     (set COMP=Luna& set CARPETA=Y si la Luna desapareciera esta noche)
if /i "%V%"=="rotacion" (set COMP=Rotacion& set CARPETA=Y si la Tierra dejara de girar 1 segundo)
if /i "%V%"=="musculo"  (set COMP=Musculo& set CARPETA=Y si ganaras 1 kg de musculo cada hora& set H=1)
if "%COMP%"=="" (echo Video desconocido: %V% & goto fin)
where node >nul 2>&1 || (echo Falta Node.js. Instalalo desde nodejs.org & goto fin)
where ffmpeg >nul 2>&1 || (echo Falta ffmpeg. & goto fin)
where python >nul 2>&1 || (echo Falta Python 3. & goto fin)
if not exist node_modules (echo Instalando dependencias... & call npm install || goto error)
if not exist out mkdir out
if not exist public mkdir public
echo [1/6] Voz (mp3 a wav)...
ffmpeg -v error -y -i voz/%V%/voz.mp3 -ar 48000 -ac 1 public/voz_%V%.wav || goto error
set OUTRO=out/outro_final.mp4
if "%H%"=="1" set OUTRO=out/outro_final_h.mp4
if "%H%"=="1" (if not exist out\outro_final_h.mp4 call :cierreh || goto error) else (if not exist out\outro_final.mp4 call :cierre || goto error)
echo [2/6] Animacion de %COMP% (unos 20 minutos)...
call npx remotion render src/index.ts %COMP% out/%V%_mudo.mp4 --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000 || goto error
echo [3/6] Sonido...
python -I audio/mezcla.py %V% public/voz_%V%.wav out/%V%_mezcla.wav out/%V%_mudo.mp4 || goto error
echo [4/6] Uniendo imagen y sonido...
ffmpeg -v error -y -i out/%V%_mudo.mp4 -i out/%V%_mezcla.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/%V%_sin_subs.mp4 || goto error
echo [5/6] Subtitulos...
python -I subtitulos.py voz/%V%/palabras.json out/%V%_sin_subs.mp4 out/%V%_final.mp4 || goto error
echo [6/6] Cierre "suscribete y comenta"...
ffmpeg -v error -y -i out/%V%_final.mp4 -i %OUTRO% -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k out/%V%_con_cierre.mp4 || goto error
if not exist "..\%CARPETA%" mkdir "..\%CARPETA%"
copy /y "out\%V%_con_cierre.mp4" "..\%CARPETA%\%CARPETA%.mp4" >nul || goto error
echo.
echo LISTO: "%~dp0..\%CARPETA%\%CARPETA%.mp4"
goto fin

:cierre
echo [*] Primero el cierre (se hace una sola vez)...
ffmpeg -v error -y -i voz/outro/voz.mp3 -ar 48000 -ac 1 public/voz_outro.wav || exit /b 1
call npx remotion render src/index.ts Outro out/outro_mudo.mp4 --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000 || exit /b 1
python -I audio/mezcla.py outro public/voz_outro.wav out/outro_mezcla.wav || exit /b 1
ffmpeg -v error -y -i out/outro_mudo.mp4 -i out/outro_mezcla.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/outro_sin_subs.mp4 || exit /b 1
python -I subtitulos.py voz/outro/palabras.json out/outro_sin_subs.mp4 out/outro_final.mp4 || exit /b 1
exit /b 0

:cierreh
echo [*] Primero el cierre horizontal (se hace una sola vez)...
if not exist publicoz_outro.wav ffmpeg -v error -y -i voz/outro/voz.mp3 -ar 48000 -ac 1 public/voz_outro.wav || exit /b 1
call npx remotion render src/index.ts OutroH out/outro_h_mudo.mp4 --codec h264 --crf 18 --gl=angle --concurrency=3 --timeout=240000 || exit /b 1
python -I audio/mezcla.py outro public/voz_outro.wav out/outro_h_mezcla.wav || exit /b 1
ffmpeg -v error -y -i out/outro_h_mudo.mp4 -i out/outro_h_mezcla.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/outro_h_sin_subs.mp4 || exit /b 1
python -I subtitulos.py voz/outro/palabras.json out/outro_h_sin_subs.mp4 out/outro_final_h.mp4 || exit /b 1
exit /b 0

:error
echo.
echo *** Algo fallo. Revisa el mensaje de arriba. ***
:fin
pause
