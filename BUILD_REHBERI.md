# electron-builder.yml Yapılandırma Rehberi

## 📝 Yapılandırma Tamamlandı!

electron-builder.yml dosyanız hazır. Şimdi build için gereken adımlar:

## 🎯 ÖNEMLİ: Şu Adımları Tamamlayın

### 1️⃣ GitHub Repository Oluşturun (Auto-Update için)

```bash
# Git repository başlat
cd C:\Users\lenovo\GorselDonusturucu
git init
git add .
git commit -m "İlk commit"

# GitHub'da repo oluşturun ve bağlayın
git remote add origin https://github.com/KULLANICIADI/gorsel-donusturucu.git
git push -u origin main
```

**electron-builder.yml'de değiştirin:**
```yaml
publish:
  provider: github
  owner: KULLANICIADI  # ← GitHub kullanıcı adınızı yazın
  repo: gorsel-donusturucu
```

### 2️⃣ İkon Dosyalarını Hazırlayın

Aşağıdaki dosyaları `assets/` klasörüne ekleyin:

```
assets/
├── icon.ico          # Windows (256x256 veya 512x512)
├── icon.icns         # macOS
├── icon.png          # Linux (512x512)
├── header.bmp        # NSIS installer üst banner (150x57)
└── sidebar.bmp       # NSIS installer yan banner (164x314)
```

**Hızlı ikon oluşturma:**
```bash
npm install -g electron-icon-builder

# PNG'den tüm formatları oluştur
electron-icon-builder --input=./logo.png --output=./assets
```

### 3️⃣ Lisans Dosyası Oluşturun

LICENSE.txt dosyası kurulum sırasında gösterilecek:

```bash
# Basit bir lisans oluştur
echo "Görsel Dönüştürücü - Yazılım Lisans Sözleşmesi" > LICENSE.txt
```

### 4️⃣ ImageMagick'i Uygulamaya Dahil Etme (Opsiyonel)

**Seçenek A: Kullanıcıdan ImageMagick kurmasını isteyin**
- Daha kolay
- Dosya boyutu küçük
- Kurulum scripti ekleyin

**Seçenek B: ImageMagick'i uygulama ile paketleyin**

```powershell
# ImageMagick dosyalarını kopyala
New-Item -ItemType Directory -Path "assets/imagemagick" -Force
Copy-Item "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\*" -Destination "assets/imagemagick" -Recurse
```

### 5️⃣ Build Komutları

```bash
# Sadece Windows için build
npm run electron-build -- --win

# Tüm platformlar için
npm run electron-build -- --win --mac --linux

# Portable versyon (yüklemesiz)
npm run electron-build -- --win portable
```

## 🔐 Kod İmzalama (Opsiyonel ama Önerilir)

### Windows İçin

```bash
# .pfx sertifika edinin (DigiCert, Sectigo vb.)
# electron-builder.yml'de yorumu kaldırın:
```

```yaml
win:
  certificateFile: cert.pfx
  certificatePassword: ${env.CERTIFICATE_PASSWORD}
```

**Ortam değişkenini ayarlayın:**
```powershell
$env:CERTIFICATE_PASSWORD = "sertifika-sifresi"
```

### macOS İçin

```yaml
mac:
  identity: "Developer ID Application: Adınız (TEAM_ID)"
```

## 🚀 Auto-Update Sistemi

### GitHub Token Oluşturun

1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token" → `repo` yetkisi verin
3. Token'ı kopyalayın

**Build yaparken:**
```powershell
$env:GH_TOKEN = "github_pat_xxxxxxxxxxxxx"
npm run electron-build -- --win --publish always
```

### main.js'e Auto-Update Ekleyin

electron/main.js dosyasına ekleyin:

```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  createWindow();
  
  // Auto-update kontrolü
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });
  
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });
});
```

## 📦 Build Çıktısı

Build başarılı olduğunda:

```
release/
├── GorselDonusturucu-Setup-1.0.0.exe       # Installer
├── GorselDonusturucu-Setup-1.0.0.exe.blockmap
├── latest.yml                               # Auto-update için
└── win-unpacked/                           # Unpacked dosyalar
```

## ✅ Yapılandırma Kontrol Listesi

- [ ] GitHub repository oluşturuldu
- [ ] electron-builder.yml'de `owner` değiştirildi
- [ ] İkon dosyaları eklendi (assets/)
- [ ] LICENSE.txt oluşturuldu
- [ ] package.json'da version güncellendi
- [ ] Build testi yapıldı
- [ ] Auto-update test edildi

## 🎨 İkon Gereksinimleri

### Windows (.ico)
```
256x256 veya 512x512
PNG formatında
Şeffaf arka plan
```

### macOS (.icns)
```
1024x1024
PNG formatında
Otomatik oluştur: npm install -g png2icons
```

### Linux (.png)
```
512x512
PNG formatında
```

## 🛠️ Hata Giderme

### "Cannot find icon" hatası
```bash
# İkon oluştur
npm install -g electron-icon-builder
electron-icon-builder --input=./logo.png --output=./assets
```

### "GitHub token not found"
```powershell
# Token'ı ortam değişkenine ekle
$env:GH_TOKEN = "your_token_here"
```

### ImageMagick bulunamıyor
```javascript
// electron/main.js'de path belirt
const imageMagickPath = path.join(
  process.resourcesPath, 
  'imagemagick'
);
```

## 📊 Build Boyutları (Tahmini)

- **Sadece Sharp**: ~150 MB
- **Sharp + ImageMagick**: ~250 MB
- **Sıkıştırılmış installer**: ~80-120 MB

## 🎯 Hızlı Başlangıç

```bash
# 1. İkonları hazırla
npm install -g electron-icon-builder

# 2. LICENSE.txt oluştur
echo "Lisans metni" > LICENSE.txt

# 3. Build yap
npm run electron-build -- --win

# 4. Test et
.\release\GorselDonusturucu-Setup-1.0.0.exe
```

## 💡 Öneriler

1. **İlk build'i local test edin** - Publish yapmadan önce
2. **Version'u düzenli artırın** - package.json'da
3. **Release notes ekleyin** - GitHub releases'de
4. **Beta testi yapın** - Az sayıda kullanıcıyla

---

**Hazır! Şimdi build yapabilirsiniz:** 
```bash
npm run electron-build -- --win
```
