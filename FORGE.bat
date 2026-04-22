@echo off
setlocal
title FORGE GYM OS
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto :nonode

if not exist "node_modules\" (
  echo First run - installing dependencies. This may take a minute...
  call npm install || goto :fail
)

if not exist "dist\" (
  echo Building frontend...
  call npm run build || goto :fail
)

echo.
echo  FORGE GYM OS running at http://localhost:3000
echo  Close this window to shut down the server.
echo.

start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"
node server/index.js
goto :eof

:nonode
echo.
echo  Node.js is not installed on this PC.
echo  Download and install the LTS version from https://nodejs.org
echo  then double-click FORGE.bat again.
echo.
pause
exit /b 1

:fail
echo.
echo  Setup failed. See errors above.
echo.
pause
exit /b 1
