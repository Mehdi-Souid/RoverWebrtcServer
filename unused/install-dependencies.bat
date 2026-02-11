@echo off
REM Install dependencies for Rover WebRTC Server

echo ========================================
echo    Installing Dependencies
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version (recommended) and install it.
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo npm version:
npm --version
echo.

echo Installing packages...
call npm install

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next step: Run start-server.bat to start the server
echo.
pause

