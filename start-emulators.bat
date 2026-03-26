@echo off
echo ========================================
echo  Firebase Emulator Suite - Startup
echo ========================================
echo.

REM Set Java environment
set JAVA_HOME=C:\Program Files\Microsoft\jdk-11.0.30.7-hotspot
set PATH=%PATH%;%JAVA_HOME%\bin

echo Checking Java installation...
java -version
if errorlevel 1 (
    echo ERROR: Java not found! Please install Java 11 or higher.
    pause
    exit /b 1
)

echo.
echo Starting Firebase Emulators...
echo.
echo Emulator UI: http://localhost:4000
echo Auth Emulator: http://localhost:9099
echo Firestore Emulator: http://localhost:8080
echo.

REM Start Firebase Emulators
firebase emulators:start

pause
