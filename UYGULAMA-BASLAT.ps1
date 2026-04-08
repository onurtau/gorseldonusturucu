# Görsel Dönüştürücü - Geliştirme Modu Başlatma Scripti
# Çift tıklayarak uygulamayı başlatın

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GÖRSEL DÖNÜŞTÜRÜCÜ BAŞLATILIYOR" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Proje klasörüne git
Set-Location -Path "C:\Users\lenovo\GorselDonusturucu"

Write-Host "[1/2] React Development Server başlatılıyor..." -ForegroundColor Green

# React dev server'ı arka planda başlat
$reactJob = Start-Job -ScriptBlock {
    Set-Location -Path "C:\Users\lenovo\GorselDonusturucu"
    npm start
}

Write-Host "      ✓ React server başlatıldı (arka planda)" -ForegroundColor Gray
Write-Host ""
Write-Host "[2/2] Electron penceresi açılacak (15 saniye bekleniyor)..." -ForegroundColor Green

# React server'ın hazır olmasını bekle
Start-Sleep -Seconds 15

Write-Host "      ✓ Electron başlatılıyor..." -ForegroundColor Gray
Write-Host ""

# Electron'u başlat
npm run electron

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uygulama kapatıldı." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# React server'ı durdur
Stop-Job -Job $reactJob
Remove-Job -Job $reactJob

Write-Host "Temizlik yapıldı. Bu pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Devam etmek için Enter'a basın"
