@echo off
setlocal enabledelayedexpansion

echo =========================================
echo [1/3] Running Expo Prebuild (Clean)...
echo =========================================
call npx expo prebuild --clean
if %errorlevel% neq 0 (
    echo [ERROR] Expo prebuild failed.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [2/3] Patching android/app/build.gradle...
echo =========================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0patch_gradle.ps1"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to patch build.gradle.
    exit /b %errorlevel%
)

echo.
echo =========================================
echo [3/3] Building Android Release APK...
echo =========================================
cd android
call gradlew assembleRelease

if %errorlevel% neq 0 (
    echo [ERROR] Gradle release build failed.
    cd ..
    exit /b %errorlevel%
)

cd ..
echo.
echo =========================================
echo BUILD SUCCESSFUL!
echo Output APK location: android/app/build/outputs/apk/release/
echo =========================================