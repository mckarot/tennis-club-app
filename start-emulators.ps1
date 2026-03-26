# Firebase Emulator Suite - PowerShell Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Firebase Emulator Suite - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Java environment (Java 21 required for Firebase CLI 15+)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.10-hotspot"
$env:PATH = "$env:PATH;$env:JAVA_HOME\bin"

Write-Host "Checking Java installation..." -ForegroundColor Yellow
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Java not found! Please install Java 11 or higher." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting Firebase Emulators..." -ForegroundColor Green
Write-Host ""
Write-Host "Emulator UI: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Auth Emulator: http://localhost:9099" -ForegroundColor Cyan
Write-Host "Firestore Emulator: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""

# Start Firebase Emulators
firebase emulators:start
