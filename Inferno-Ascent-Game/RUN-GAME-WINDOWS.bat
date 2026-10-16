@echo off
cd /d "%~dp0"
set "NEON_ENTRY=index.html"
if exist PLAY.html set "NEON_ENTRY=PLAY.html"
where py >nul 2>&1
if not errorlevel 1 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000/%NEON_ENTRY%"
  py -m http.server 8000 --bind 127.0.0.1
  pause
  exit /b
)
where python >nul 2>&1
if not errorlevel 1 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000/%NEON_ENTRY%"
  python -m http.server 8000 --bind 127.0.0.1
  pause
  exit /b
)
echo Python was not found. Open PLAY.html (or index.html) directly, or install Python to use this fallback.
pause
