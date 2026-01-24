@echo off
TITLE FreshCart App Launcher
echo ========================================================
echo        Starting FreshCart Grocery Application
echo ========================================================
echo.
echo [1/2] Initializing Backend on Port 5001...
echo [2/2] Initializing Frontend on Port 3001...
echo.
echo Please wait for both services to start...
echo.

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

if not exist "client\node_modules\" (
    echo client/node_modules not found. Installing client dependencies...
    cd client
    call npm install
    cd ..
)

:: Run the development server using the existing concurrently script
npm run dev

pause
