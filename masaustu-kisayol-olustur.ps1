# Masaustu Kisayolu Olusturma Scripti

Write-Host "Masaustu kisayolu olusturuluyor..." -ForegroundColor Cyan
Write-Host ""

$WshShell = New-Object -comObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')

# Kisayol 1: Gelistirme Modu
$Shortcut = $WshShell.CreateShortcut("$Desktop\Gorsel Donusturucu (Gelistirme).lnk")
$Shortcut.TargetPath = "C:\Users\lenovo\GorselDonusturucu\UYGULAMA-BASLAT.bat"
$Shortcut.WorkingDirectory = "C:\Users\lenovo\GorselDonusturucu"
$Shortcut.Description = "Gorsel Donusturucu - Gelistirme Modu"
$Shortcut.Save()

Write-Host "Masaustu kisayolu olusturuldu!" -ForegroundColor Green
Write-Host "Konum: $Desktop\Gorsel Donusturucu (Gelistirme).lnk" -ForegroundColor White
Write-Host ""
Write-Host "Kullanim:" -ForegroundColor Yellow
Write-Host "1. Masaustundeki kisayola cift tiklayin" -ForegroundColor White
Write-Host "2. 15 saniye bekleyin" -ForegroundColor White
Write-Host "3. Electron penceresi acilacak" -ForegroundColor White
Write-Host ""

Read-Host "Devam etmek icin Enter'a basin"
