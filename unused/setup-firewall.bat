@echo off
REM Setup Windows Firewall for Rover WebRTC Server
REM This script must be run as Administrator

echo ========================================
echo    Windows Firewall Setup
echo ========================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Adding firewall rule for port 9000...
echo.

REM Remove old rule if exists
netsh advfirewall firewall delete rule name="Rover WebRTC Server" >nul 2>&1

REM Add new rule
netsh advfirewall firewall add rule name="Rover WebRTC Server" dir=in action=allow protocol=TCP localport=9000

if %ERRORLEVEL% EQU 0 (
    echo [OK] Firewall rule added successfully!
    echo.
    echo Port 9000 is now open for incoming connections.
) else (
    echo [ERROR] Failed to add firewall rule!
    echo.
    echo Please add the rule manually:
    echo 1. Open Windows Defender Firewall
    echo 2. Click "Advanced settings"
    echo 3. Click "Inbound Rules" - "New Rule"
    echo 4. Select "Port" - Next
    echo 5. Select "TCP" and enter port 9000 - Next
    echo 6. Select "Allow the connection" - Next
    echo 7. Check all profiles - Next
    echo 8. Name it "Rover WebRTC Server" - Finish
)

echo.
echo ========================================
echo    Firewall Setup Complete
echo ========================================
echo.
pause

