@echo off
REM Rover WebRTC Server - Windows Startup Script
REM This script starts the signaling server on your Windows PC

echo ========================================
echo    Rover WebRTC Server - Starting
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Get local IP address
echo Detecting your IP addresses...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo   Local IP: !IP!
)
echo.

REM Get public IP (optional)
echo Detecting your public IP...
for /f %%i in ('curl -s https://api.ipify.org') do set PUBLIC_IP=%%i
if defined PUBLIC_IP (
    echo   Public IP: %PUBLIC_IP%
) else (
    echo   Public IP: Could not detect
)
echo.

echo ========================================
echo    Server Configuration
echo ========================================
echo   Port: 9000
echo   Protocol: HTTP + WebSocket
echo ========================================
echo.

echo Starting server...
echo.
echo ========================================
echo    Server URLs
echo ========================================
echo   Local Dashboard:  http://localhost:9000
echo   Network Dashboard: http://YOUR_LOCAL_IP:9000
echo   Android URL: ws://YOUR_PUBLIC_IP:9000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

