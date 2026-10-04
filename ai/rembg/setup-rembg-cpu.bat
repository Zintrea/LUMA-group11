@echo off
setlocal
set "ROOT=%~dp0"
set "VENV=%ROOT%.venv"
set "PYTHON=%VENV%\Scripts\python.exe"

py -3.11 -c "import sys; print(sys.version)" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Python 3.11 x64 is required. Install it, then run this script again.
  exit /b 1
)

if not exist "%PYTHON%" (
  echo Creating isolated Python 3.11 environment...
  py -3.11 -m venv "%VENV%"
  if errorlevel 1 (
    echo ERROR: Cannot create .venv.
        exit /b 1
  )
)

if not exist "%ROOT%models" mkdir "%ROOT%models"
if not exist "%ROOT%logs" mkdir "%ROOT%logs"
if not exist "%ROOT%output" mkdir "%ROOT%output"

echo Installing pinned CPU dependencies...
"%PYTHON%" -m pip install --upgrade pip
"%PYTHON%" -m pip install -r "%ROOT%requirements-cpu.txt"
if errorlevel 1 (
  echo ERROR: Dependency installation failed. Check the internet connection and try again.
  exit /b 1
)

echo.
echo PASS: Setup complete.
echo Next step: double-click start-rembg-cpu.bat
