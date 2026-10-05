@echo off
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000"
  py -m http.server 8000 --bind 127.0.0.1
  pause
  exit /b
)
where python >nul 2>&1
if not errorlevel 1 (
  start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000"
  python -m http.server 8000 --bind 127.0.0.1
  pause
  exit /b
)
echo Python was not found. Open index.html directly, or install Python to use this fallback.
pause
