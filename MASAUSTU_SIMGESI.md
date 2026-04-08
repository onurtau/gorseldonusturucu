# 🖥️ Masaüstü Simgesi ile Çalıştırma Rehberi

## 🎯 İlk Kurulum (Tek Sefer)

### 1. Installer Oluştur

```powershell
# Proje dizinine git
cd C:\Users\lenovo\GorselDonusturucu

# Installer oluştur
npm run electron-build -- --win
```

Bu komut çalıştığında:
- ✅ `release` klasörü oluşturulur
- ✅ `GorselDonusturucu-Setup-1.0.0.exe` dosyası üretilir
- ⏱️ İlk build: 2-5 dakika sürer

### 2. Installer'ı Çalıştır

```powershell
# Oluşan installer'ı çalıştır
.\release\GorselDonusturucu-Setup-1.0.0.exe
```

**Installer yapacaklar:**
1. ✅ Uygulamayı `C:\Users\lenovo\AppData\Local\Programs\gorsel-donusturucu` klasörüne kurar
2. ✅ **Masaüstünde simge oluşturur** 🎉
3. ✅ Başlat Menüsü'ne ekler
4. ✅ Kaldırma programı ekler
5. ✅ Otomatik çalıştır (isteğe bağlı)

### 3. Artık Kullanıma Hazır!

Masaüstündeki **"Görsel Dönüştürücü"** simgesine **çift tıkla** → Uygulama açılır! 🚀

---

## 🔄 Günlük Kullanım

Her kullanmak istediğinizde:

```
1. Masaüstünde "Görsel Dönüştürücü" simgesini bul
2. Çift tıkla
3. Uygulama açılır
```

Ya da:

```
1. Windows Başlat Menüsü'nü aç
2. "Görsel Dönüştürücü" yaz
3. Enter'a bas
```

---

## 🛠️ Dev Modu vs Production Modu

### Dev Modu (Geliştirme İçin)

```powershell
npm run electron-dev
```

- ✅ Kod değişikliklerini anında görürsünüz
- ✅ Konsol açık
- ⚠️ Masaüstü simgesi OLUŞTURMAZ
- ⚠️ Sadece geliştirme için

### Production Modu (Kullanıcılar İçin)

```powershell
npm run electron-build -- --win
# Sonra installer'ı çalıştır
```

- ✅ Masaüstü simgesi oluşturur
- ✅ Profesyonel kurulum
- ✅ Otomatik güncelleme desteği
- ✅ Kullanıcılar için ideal

---

## 📦 Kullanıcılara Nasıl Dağıtılır?

### Seçenek 1: GitHub Releases (Önerilen)

```powershell
# 1. Build al
npm run electron-build -- --win

# 2. GitHub'da Release oluştur
# Releases → Create a new release
# Tag: v1.0.0
# Title: Görsel Dönüştürücü v1.0.0

# 3. .exe dosyasını yükle
# release/GorselDonusturucu-Setup-1.0.0.exe
```

Kullanıcılar:
```
1. https://github.com/onurtau/gorsel-donusturucu/releases
2. En son sürümü indir
3. .exe dosyasını çalıştır
4. Masaüstü simgesi otomatik oluşur
```

### Seçenek 2: Kendi Web Sitenden

```
1. Web sitenizde download butonu ekle
2. .exe dosyasını hosting'e yükle
3. Kullanıcılar indirir, çalıştırır
```

### Seçenek 3: Microsoft Store

```
1. Microsoft Partner Center hesabı aç ($19 yıllık)
2. .appx paket oluştur
3. Store'a yükle
4. Onaylandıktan sonra yayına girer
```

---

## 🎨 Simge Özelleştirme

### Icon Değiştirme

1. `.ico` formatında logo hazırla (256x256 önerilen)
2. `assets/icon.ico` olarak kaydet
3. `electron-builder.yml` kontrol et:

```yaml
win:
  icon: assets/icon.ico
```

4. Yeniden build al:

```powershell
npm run electron-build -- --win
```

### Icon Generator Araçları

- https://www.icoconverter.com/
- https://convertio.co/png-ico/
- Adobe Photoshop/Illustrator

---

## 🚀 Otomatik Başlatma (İsteğe Bağlı)

Bilgisayar açıldığında otomatik başlat:

```javascript
// electron/main.js

const { app } = require('electron');

app.setLoginItemSettings({
  openAtLogin: true, // Windows başlangıcında aç
  path: app.getPath('exe')
});
```

---

## 🗑️ Kaldırma

### Kullanıcılar için:

```
1. Windows Ayarlar → Uygulamalar
2. "Görsel Dönüştürücü" ara
3. Kaldır
```

Ya da:

```
1. Başlat Menüsü → Görsel Dönüştürücü
2. Sağ tık → Kaldır
```

Masaüstü simgesi otomatik silinir.

---

## 🐛 Yaygın Sorunlar

### Simge Oluşmuyor?

```yaml
# electron-builder.yml kontrol et

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: assets/icon.ico

nsis:
  createDesktopShortcut: true  # Bu satır olmalı!
  createStartMenuShortcut: true
```

### İlk Açılışta Hata?

```
Windows Defender SmartScreen uyarısı normaldir.
"More info" → "Run anyway"

Çözüm:
- Uygulamayı kod imzalama sertifikası ile imzala
- DigiCert, Sectigo gibi firmalardan alınır
- ~$100-300/yıl
```

### Build Hatası?

```powershell
# node_modules temizle
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Yeniden yükle
npm install

# Build
npm run electron-build -- --win
```

---

## ✅ Kontrol Listesi

İlk dağıtım öncesi:

- [ ] Icon hazırlandı mı? (icon.ico)
- [ ] electron-builder.yml doğru mu?
- [ ] Test build alındı mı?
- [ ] Installer test edildi mi?
- [ ] Masaüstü simgesi oluşuyor mu?
- [ ] Uygulama düzgün açılıyor mu?
- [ ] Kaldırma çalışıyor mu?

---

## 🎯 Hızlı Özet

```powershell
# 1. Build al
npm run electron-build -- --win

# 2. Test et
.\release\GorselDonusturucu-Setup-1.0.0.exe

# 3. Masaüstü simgesine çift tıkla

# ✅ HAZIR!
```

Herhangi bir sorun olursa sorabilirsiniz! 🚀
