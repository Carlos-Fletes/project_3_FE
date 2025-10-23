# React Native Expo Development Server Starter
# This script ensures Node.js is in PATH and starts the development server

Write-Host "Setting up React Native Expo Development Environment..." -ForegroundColor Green

# Add Node.js to PATH for this session
$env:PATH += ";C:\Program Files\nodejs\"

Write-Host "Node.js version: $(node --version)" -ForegroundColor Cyan
Write-Host "npm version: $(npm --version)" -ForegroundColor Cyan

Write-Host "`nChoose your development mode:" -ForegroundColor Yellow
Write-Host "=== STANDARD EXPO GO ===" -ForegroundColor Cyan
Write-Host "1. Web Browser (localhost:8081)" -ForegroundColor White
Write-Host "2. Android (Expo Go app)" -ForegroundColor White
Write-Host "3. iOS (Expo Go app)" -ForegroundColor White
Write-Host "4. All platforms (Expo Go)" -ForegroundColor White
Write-Host "`n=== DEVELOPMENT BUILD ===" -ForegroundColor Magenta
Write-Host "5. Development Build Server (for custom dev clients)" -ForegroundColor White
Write-Host "6. Build Android Development APK" -ForegroundColor White
Write-Host "7. Build iOS Development IPA (macOS only)" -ForegroundColor White
Write-Host "8. Build All Development Clients" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-8)"

switch ($choice) {
    "1" { npm run web }
    "2" { npm run android }
    "3" { npm run ios }
    "4" { npm start }
    "5" { 
        Write-Host "Starting development build server..." -ForegroundColor Green
        Write-Host "Note: You need a development build installed on your device!" -ForegroundColor Yellow
        npm run start:dev-build 
    }
    "6" { 
        Write-Host "Building Android development APK..." -ForegroundColor Green
        Write-Host "Note: This requires EAS account login!" -ForegroundColor Yellow
        npm run build:android 
    }
    "7" { 
        Write-Host "Building iOS development IPA..." -ForegroundColor Green
        Write-Host "Note: This requires EAS account login and macOS!" -ForegroundColor Yellow
        npm run build:ios 
    }
    "8" { 
        Write-Host "Building all development clients..." -ForegroundColor Green
        Write-Host "Note: This requires EAS account login!" -ForegroundColor Yellow
        npm run build:all 
    }
    default { 
        Write-Host "Invalid choice. Starting web by default..." -ForegroundColor Red
        npm run web 
    }
}