# VS Code Chat Otomatik Yedekleme Kurulum Scripti
# Bu script otomatik yedekleme sistemini kurar

Write-Host "🚀 VS Code Chat Otomatik Yedekleme Kurulumu" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Kullanıcıdan onay al
Write-Host "`n⚠️  Bu script şu işlemleri yapacak:" -ForegroundColor Yellow
Write-Host "  1. Task Scheduler'da otomatik görev oluşturur" -ForegroundColor White
Write-Host "  2. Her 2 saatte bir chat geçmişini yedekler" -ForegroundColor White
Write-Host "  3. İlk yedeği şimdi oluşturur`n" -ForegroundColor White

$confirm = Read-Host "Devam etmek istiyor musunuz? (E/H)"
if ($confirm -ne 'E' -and $confirm -ne 'e') {
    Write-Host "❌ Kurulum iptal edildi." -ForegroundColor Red
    exit
}

# Yönetici kontrolü
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n⚠️  Bu script yönetici yetkileri gerektirir!" -ForegroundColor Yellow
    Write-Host "PowerShell'i 'Yönetici olarak çalıştır' ile açın ve tekrar deneyin.`n" -ForegroundColor Cyan
    
    # Otomatik yönetici modunda tekrar başlat
    $answer = Read-Host "Otomatik olarak yönetici modunda başlatılsın mı? (E/H)"
    if ($answer -eq 'E' -or $answer -eq 'e') {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    }
    exit
}

try {
    Write-Host "`n📋 Adım 1: Task Scheduler görevi oluşturuluyor..." -ForegroundColor Cyan
    
    # Görev zaten varsa sil
    $existingTask = Get-ScheduledTask -TaskName "VSCode_ChatBackup" -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName "VSCode_ChatBackup" -Confirm:$false
        Write-Host "   ℹ️  Eski görev silindi" -ForegroundColor Gray
    }
    
    # Yeni görev oluştur
    $scriptPath = "C:\Users\lenovo\GorselDonusturucu\backup-chat-history.ps1"
    
    # Script dosyası var mı kontrol et
    if (-not (Test-Path $scriptPath)) {
        Write-Host "   ❌ Hata: backup-chat-history.ps1 bulunamadı!" -ForegroundColor Red
        Write-Host "   Dosya konumu: $scriptPath" -ForegroundColor Yellow
        exit 1
    }
    
    $action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
        -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    
    # Her 2 saatte bir tekrarla
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
        -RepetitionInterval (New-TimeSpan -Hours 2) `
        -RepetitionDuration ([TimeSpan]::MaxValue)
    
    # Kullanıcı giriş yaptığında çalışsın
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
    
    # Görevi kaydet
    Register-ScheduledTask -TaskName "VSCode_ChatBackup" `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Description "VS Code Copilot Chat geçmişini her 2 saatte bir otomatik yedekler" | Out-Null
    
    Write-Host "   ✅ Görev başarıyla oluşturuldu" -ForegroundColor Green
    
    # Görevi test et
    Write-Host "`n📋 Adım 2: İlk yedekleme yapılıyor..." -ForegroundColor Cyan
    
    # Backup scriptini çalıştır
    & $scriptPath
    
    Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
    Write-Host "✅ KURULUM TAMAMLANDI!" -ForegroundColor Green
    Write-Host ("=" * 50) -ForegroundColor Gray
    
    Write-Host "`n📊 Özet:" -ForegroundColor Cyan
    Write-Host "  • Otomatik yedekleme: AKTIF ✅" -ForegroundColor White
    Write-Host "  • Yedekleme sıklığı: Her 2 saatte bir" -ForegroundColor White
    Write-Host "  • Yedek konumu: C:\Users\lenovo\GorselDonusturucu\ChatBackups" -ForegroundColor White
    Write-Host "  • Eski yedekler: 30 gün sonra otomatik silinir" -ForegroundColor White
    
    Write-Host "`n💡 İpuçları:" -ForegroundColor Yellow
    Write-Host "  • Yedekleri görmek için: explorer C:\Users\lenovo\GorselDonusturucu\ChatBackups" -ForegroundColor White
    Write-Host "  • Manuel yedekleme: .\backup-chat-history.ps1" -ForegroundColor White
    Write-Host "  • Görevi yönetmek için: Task Scheduler açın (taskschd.msc)" -ForegroundColor White
    
    Write-Host "`n🔍 Task Scheduler'ı açmak ister misiniz?" -ForegroundColor Cyan
    $openTask = Read-Host "(E/H)"
    if ($openTask -eq 'E' -or $openTask -eq 'e') {
        Start-Process taskschd.msc
    }
    
} catch {
    Write-Host "`n❌ HATA: Kurulum başarısız!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host "`nDetaylı hata:" -ForegroundColor Gray
    Write-Host $_ -ForegroundColor Gray
}

Write-Host "`nKurulum tamamlandı. Bu pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "`nDevam etmek için Enter'a basın"
