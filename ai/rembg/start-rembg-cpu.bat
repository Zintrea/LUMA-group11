@echo off
setlocal
set "ROOT=%~dp0"
set "PYTHON=%ROOT%.venv\Scripts\python.exe"
set "PID_FILE=%ROOT%rembg.pid"

if not exist "%PYTHON%" (
  echo ERROR: rembg is not installed yet. Run setup-rembg-cpu.bat first.
  pause
  exit /b 1
)

powershell -NoProfile -Command "$listener = @(Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue); if ($listener.Count -gt 0) { exit 1 }; exit 0"
if not errorlevel 1 goto port_free

echo ERROR: Port 7000 is already listening. Do not start a second service.
echo Run stop-rembg-cpu.bat only if it belongs to this LUMA rembg service.
pause
exit /b 1

:port_free
if not exist "%ROOT%logs" mkdir "%ROOT%logs"
if not exist "%ROOT%models" mkdir "%ROOT%models"
for /f %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%T"
set "OUT_LOG=%ROOT%logs\rembg-%STAMP%-stdout.log"
set "ERR_LOG=%ROOT%logs\rembg-%STAMP%-stderr.log"

set "REMBG_HOME=%ROOT%"
set "REMBG_MODEL=u2net"

if exist "%PID_FILE%" del "%PID_FILE%"
start "LUMA rembg CPU" /b "%PYTHON%" "%ROOT%server.py" --host 0.0.0.0 --port 7000 --pid-file "%PID_FILE%" 1>>"%OUT_LOG%" 2>>"%ERR_LOG%"
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
powershell -NoProfile -Command "$listener = @(Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue); if ($listener.Count -gt 0) { exit 0 }; exit 1"
if errorlevel 1 (
  echo ERROR: Service did not open port 7000.
  echo Check: %ERR_LOG%
  pause
  exit /b 1
)

echo PASS: LUMA rembg CPU service is running.
echo PC3 contract: POST http://^<PC2-IP^>:7000/api/remove
echo Multipart field: image
echo Runtime logs: %ROOT%logs
pause
