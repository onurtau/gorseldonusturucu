# 🛠️ Masaüstü Installer Sorunu ve Çözümü

## ❌ Sorun

Windows'ta `npm run electron-build` komutu şu hata veriyor:

```
ERROR: Cannot create symbolic link : Gereken ayrıcalık istemci tarafından sağlanmıyor
```

**Neden?** electron-builder kod imzalama araçlarını indirirken symlink oluşturmaya çalışıyor, bu Windows'ta **yönetici yetkisi** veya **Developer Mode** gerektirir.

---

## ✅ ÇÖZÜM 1: PowerShell Yönetici Modunda Çalıştır (EN KOLAY)

### Adım Adım:

1. **PowerShell'i Kapat** (şu anki pencereyi)

2. **Windows Başlat Menüsü**'ne tıkla

3. **"PowerShell"** yaz

4. **Sağ tıkla** → **"Run as administrator"** seç
   
   ![Admin Mode](https://i.imgur.com/xyz.png)

5. **Evet/Yes** butonuna tıkla (UAC uyarısı)

6. Yönetici PowerShell'de şu komutları çalıştır:

```powershell
cd C:\Users\lenovo\GorselDonusturucu
npm run electron-build
```

7. **2-5 dakika** bekle, build tamamlansın

8. **EXE Dosyası Burada:**
   ```
   C:\Users\lenovo\GorselDonusturucu\release\GorselDonusturucu-Setup-1.0.0.exe
   ```

9. **Çift tıkla** installer'ı çalıştır

10. **Masaüstünde simge otomatik oluşur!** 🎉

---

## ✅ ÇÖZÜM 2: Windows Developer Mode Aç (KALICIsolution)

### Windows 10/11:

1. **Windows Ayarlar** aç (Win + I)

2. **"Update & Security"** → **"For developers"**

3. **"Developer Mode"** seçeneğini **ON** yap

   ![Developer Mode](https://docs.microsoft.com/en-us/windows/images/devmode.png)

4. **Evet**'e tıkla

5. **(Opsiyonel)** Bilgisayarı yeniden başlat

6. PowerShell'de normal modda çalıştır:

```powershell
cd C:\Users\lenovo\GorselDonusturucu
npm run electron-build
```

**Artık symbolic link hatası almayacaksınız!**

---

## ✅ ÇÖZÜM 3: Portable Versiyon (Installer Olmadan)

Eğer installer istemiyorsanız, direkt çalıştırılabilir dosya:

```powershell
cd C:\Users\lenovo\GorselDonusturucu
npm run build
npx electron-packager . --platform=win32 --arch=x64 --out=release --overwrite
```

**Uygulama Burada:**
```
C:\Users\lenovo\GorselDonusturucu\release\gorsel-donusturucu-win32-x64\gorsel-donusturucu.exe
```

### Manuel Masaüstü Simgesi Oluştur:

1. Uygulamayı **sağ tıkla**
2. **"Create shortcut"**
3. Shortcut'u **Masaüstü**'ne taşı
4. **Bitti!** 🎯

---

## 📋 Hangi Çözümü Seçmeliyim?

| Çözüm         | Süre  | Zorluk | Sonuç                        |
|---------------|-------|--------|------------------------------|
| Yönetici Modu | 5 dk  | Kolay  | ✅ Profesyonel installer      |
| Developer Mode| 10 dk | Orta   | ✅ Kalıcı çözüm               |
| Portable      | 3 dk  | Kolay  | ⚠️ Manuel shortcut gerekir   |

**Önerim:** 🏆 **Yönetici Modu** (Çözüm 1) - En hızlı ve profesyonel

---

## 🎯 Build Başarılı Olduktan Sonra

### 1. Installer'ı Test Et

```powershell
cd C:\Users\lenovo\GorselDonusturucu\release
.\GorselDonusturucu-Setup-1.0.0.exe
```

### 2. Kurulum Sırasında:

- ✅ Kurulum dizini seç (varsayılan: `C:\Users\lenovo\AppData\Local\Programs\gorsel-donusturucu`)
- ✅ "Create Desktop Shortcut" işaretli olsun
- ✅ İleri → İleri → Kur

### 3. Kurulum Tamamlandı!

- 🖱️ Masaüstünde **"Görsel Dönüştürücü"** simgesi var
- 🚀 Çift tıkla → Uygulama açılır
- ✨ Artık her zaman masaüstünden başlatabilirsin!

---

## 🐛 Hala Sorun mu Var?

### Hata: "EPERM: operation not permitted"

**Çözüm:** Antivirüs geçici olarak kapat

```powershell
# Windows Defender kısa süre kapat
Set-MpPreference -DisableRealtimeMonitoring $true

# Build al
npm run electron-build

# Defender'ı geri aç
Set-MpPreference -DisableRealtimeMonitoring $false
```

### Hata: "node_modules bulunamadı"

**Çözüm:** Yeniden yükle

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run electron-build
```

### Hata: "react-scripts build failed"

**Çözüm:** Cache temizle

```powershell
npm run build -- --verbose
```

---

## 📖 İlgili Dökümanlar

- [MASAUSTU_SIMGESI.md](MASAUSTU_SIMGESI.md) - Genel rehber
- [BUILD_REHBERI.md](BUILD_REHBERI.md) - Detaylı build talimatları
- [KOMUTLAR.md](KOMUTLAR.md) - Tüm komutlar

---

## ✅ Başarı Kontrol Listesi

İşlem başarılıysa:

- [ ] `release/GorselDonusturucu-Setup-1.0.0.exe` dosyası oluştu
- [ ] Installer çalıştırıldı
- [ ] Masaüstünde simge var
- [ ] Simgeye çift tıklayınca uygulama açılıyor
- [ ] Görsel dönüştürme çalışıyor

**Hepsi ✅ ise:** 🎉 **TEBR İKLER, BAŞARILI!**

---

Sorular için benimle iletişime geçebilirsiniz! 🚀
