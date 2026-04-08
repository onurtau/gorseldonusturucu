# Chat History Backup Script
# Bu script VS Code Copilot chat geçmişinizi yedekler

$chatHistoryPath = "$env:APPDATA\Code\User\globalStorage\github.copilot-chat"
$backupPath = "C:\Users\lenovo\GorselDonusturucu\ChatBackups"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = Join-Path $backupPath $timestamp

# Yedek klasörünü oluştur
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
}

New-Item -ItemType Directory -Path $backupFolder | Out-Null

# Chat geçmişini kopyala
Copy-Item -Path "$chatHistoryPath\*" -Destination $backupFolder -Recurse -Force

Write-Host "✅ Chat geçmişi yedeklendi!" -ForegroundColor Green
Write-Host "📁 Konum: $backupFolder" -ForegroundColor Cyan
Write-Host "📊 Dosya sayısı: $((Get-ChildItem $backupFolder -Recurse | Measure-Object).Count)" -ForegroundColor Yellow

# Eski yedekleri temizle (30 günden eski)
$oldBackups = Get-ChildItem $backupPath | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) }
if ($oldBackups) {
    Write-Host "`n🗑️  30 günden eski $($oldBackups.Count) yedek siliniyor..." -ForegroundColor Yellow
    $oldBackups | Remove-Item -Recurse -Force
}

Write-Host "`n✨ İşlem tamamlandı!" -ForegroundColor Green
