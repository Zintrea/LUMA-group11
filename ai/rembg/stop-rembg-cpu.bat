@echo off
setlocal
set "ROOT=%~dp0"
set "PID_FILE=%ROOT%rembg.pid"

if not exist "%PID_FILE%" (
  echo INFO: No rembg.pid file was found. Service may already be stopped.
  exit /b 0
)

set /p PID=<"%PID_FILE%"
if "%PID%"=="" (
  echo ERROR: rembg.pid is empty. Remove it manually only after confirming no service is running.
  exit /b 1
)

taskkill /PID %PID% /T /F >nul 2>&1
if errorlevel 1 (
  echo ERROR: Cannot stop PID %PID%. It may already be stopped.
  exit /b 1
)

del "%PID_FILE%"
echo PASS: LUMA rembg service stopped.