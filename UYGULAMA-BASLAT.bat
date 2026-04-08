@echo off
title Görsel Dönüştürücü - Başlatılıyor...
cd /d "%~dp0"

echo.
echo ========================================
echo   GÖRSEL DÖNÜŞTÜRÜCÜ BAŞLATILIYOR
echo ========================================
echo.
echo [1/2] React Development Server baslatiliyor...
start /B npm start

echo [2/2] Electron penceresi acilacak (10 saniye)...
timeout /t 10 /nobreak >nul

echo Electron baslatiliyor...
start npm run electron

echo.
echo ========================================
echo   BASARILI! Uygulama calisiyor.
echo ========================================
echo.
echo Not: Bu pencereyi KAPATMAYIN!
echo      Uygulamayi kapatmak icin Electron penceresini kapatin.
echo.
pause
