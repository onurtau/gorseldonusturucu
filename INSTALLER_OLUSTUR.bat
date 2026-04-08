@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo   GÖRSEL DÖNÜŞTÜRÜCÜ - INSTALLER OLUŞTURMA
echo ═══════════════════════════════════════════════════════
echo.
echo Bu işlem 2-5 dakika sürecek...
echo.
pause

cd /d "%~dp0"
echo.
echo 📍 Dizin: %CD%
echo.
echo 🏗️ Production build oluşturuluyor...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build HATASI! Lütfen hatayı kontrol edin.
    pause
    exit /b 1
)

echo.
echo ✅ Build başarılı!
echo.
echo 📦 Installer oluşturuluyor (YÖNETİCİ YETKİSİ GEREKİYOR)...
call npx electron-builder --win
if errorlevel 1 (
    echo.
    echo ⚠️ Installer oluşturulamadı!
    echo.
    echo ÇÖZÜM: Bu bat dosyasını SAĞ TIKLA → "Yönetici olarak çalıştır"
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════
echo   ✅ BAŞARILI! INSTALLER OLUŞTURULDU!
echo ═══════════════════════════════════════════════════════
echo.
echo 📍 Installer konumu:
echo    %CD%\release\GorselDonusturucu-Setup-1.0.0.exe
echo.
echo 🚀 ŞİMDİ YAPMANIZ GEREKENLER:
echo    1. release klasörüne gidin
echo    2. GorselDonusturucu-Setup-1.0.0.exe dosyasına çift tıklayın
echo    3. Kurun
echo    4. Masaüstünde simge otomatik oluşacak!
echo.
pause

echo.
echo Installer'ı şimdi açmak ister misiniz? (E/H)
set /p OPEN="Cevap: "
if /i "%OPEN%"=="E" (
    explorer "%CD%\release"
)

echo.
echo Teşekkürler! Görsel Dönüştürücü kullanıma hazır.
pause
