@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "ROOT=%~dp0"
set "VENV=!ROOT!.venv"
set "PYTHON=!VENV!\Scripts\python.exe"
set "BOOTSTRAP_PY=python"

"!BOOTSTRAP_PY!" -c "import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Python 3.11 x64 is required, but the python command is not Python 3.11.
  echo Run python --version in PowerShell to check the installed version.
  pause
  exit /b 1
)

if not exist "!PYTHON!" (
  echo Creating isolated Python 3.11 environment from the installed python command...
  "!BOOTSTRAP_PY!" -m venv "!VENV!"
  if errorlevel 1 (
    echo ERROR: Cannot create .venv.
    pause
    exit /b 1
  )
)

if not exist "!ROOT!models" mkdir "!ROOT!models"
if not exist "!ROOT!logs" mkdir "!ROOT!logs"
if not exist "!ROOT!output" mkdir "!ROOT!output"

echo Installing pinned CPU dependencies...
"!PYTHON!" -m pip install --upgrade pip
"!PYTHON!" -m pip install -r "!ROOT!requirements-cpu.txt"
if errorlevel 1 (
  echo ERROR: Dependency installation failed. Check the internet connection and try again.
  pause
  exit /b 1
)

echo.
echo PASS: Setup complete.
echo Next step: double-click start-rembg-cpu.bat
pause