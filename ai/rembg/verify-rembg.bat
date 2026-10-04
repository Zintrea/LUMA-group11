@echo off
setlocal
set "ROOT=%~dp0"
set "PYTHON=%ROOT%.venv\Scripts\python.exe"

if not exist "%PYTHON%" (
  echo ERROR: rembg is not installed yet. Run setup-rembg-cpu.bat first.
  pause
  exit /b 1
)

powershell -NoProfile -Command "$listener = @(Get-NetTCPConnection -LocalPort 7000 -State Listen -ErrorAction SilentlyContinue); if ($listener.Count -gt 0) { exit 0 }; exit 1"
if errorlevel 1 (
  echo FAIL: No service is listening on port 7000. Run start-rembg-cpu.bat first.
  pause
  exit /b 1
)

set "REMBG_HOME=%ROOT%"
set "REMBG_MODEL=u2net"
"%PYTHON%" "%ROOT%verify.py"
if errorlevel 1 (
  echo FAIL: Verification failed. Check the newest files in %ROOT%logs
  pause
  exit /b 1
)

echo PASS: PC2 is ready for PC3 POST requests.
pause