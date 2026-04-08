# Hızlı Build Komutları

## 🚀 Temel Komutlar

# Bağımlılıkları yükle
npm install

# Geliştirme modu
npm run electron-dev

# Build (sadece Windows)
npm run electron-build

# Build tüm platformlar
npm run electron-build -- --mac --linux --win

# Portable Windows versiyonu
npm run electron-build -- --win portable

## 🎨 İkon Hazırlama

# Eğer logo.png dosyanız varsa
npm install -g electron-icon-builder
electron-icon-builder --input=./logo.png --output=./assets

# Veya online araç kullanın:
# https://www.icoconverter.com/

## 📦 Build Öncesi Kontrol

# 1. package.json'da version'u güncelleyin
# 2. electron-builder.yml'de GitHub kullanıcı adınızı yazın
# 3. assets/ klasöründe ikonlar olsun
# 4. LICENSE.txt dosyası mevcut

## 🔑 GitHub Token ile Publish

$env:GH_TOKEN = "github_pat_xxxxxxxxxxxxx"
npm run electron-build -- --win --publish always

## ✅ Build Başarılı Olduğunda

# Çıktı: release/ klasöründe
# - GorselDonusturucu-Setup-1.0.0.exe (installer)
# - latest.yml (auto-update)

## 🧪 Test

# Build edilen uygulamayı test et
.\release\GorselDonusturucu-Setup-1.0.0.exe

# Local test (geliştirme)
npm run electron-dev

## 📝 Sorun Giderme

# Node modules temizle ve yeniden yükle
Remove-Item -Recurse -Force node_modules
npm install

# Electron rebuild
npm rebuild electron

# Sharp rebuild
npm rebuild sharp

## 🎯 ÜRETİM BUILD

# 1. Test et
npm run electron-dev

# 2. Build yap
npm run electron-build -- --win

# 3. Installer'ı test et
.\release\GorselDonusturucu-Setup-1.0.0.exe

# 4. GitHub'a publish et
$env:GH_TOKEN = "token_buraya"
npm run electron-build -- --win --publish always
