# 🎨 Logo Kullanım Rehberi

Uygulamanız için oluşturulan tüm logo formatları ve kullanım alanları.

## 📦 Oluşturulan Dosyalar

### 🌐 Web & PWA (`public/` klasörü)
| Dosya | Boyut | Kullanım Alanı |
|-------|-------|----------------|
| `logo.svg` | Vektör | Kaynak dosya, her yerde kullanılabilir |
| `logo-512.png` | 512x512 | Ana uygulama ikonu, PWA |
| `logo-192.png` | 192x192 | PWA, mobil cihazlar |
| `logo-64.png` | 64x64 | Küçük ikonlar, listeler |
| `favicon.ico` | 32x32 | Tarayıcı sekmesi |

### 🏪 Microsoft Store (`public/` klasörü)
| Dosya | Boyut | Kullanım Alanı |
|-------|-------|----------------|
| `logo-50.png` | 50x50 | Store liste görünümü |
| `logo-150.png` | 150x150 | Store orta tile |
| `logo-300.png` | 300x300 | Store logo |
| `logo-310.png` | 310x310 | Store büyük tile |
| `logo-512.png` | 512x512 | Uygulama ikonu |

### 🍎 macOS & Windows Desktop (`assets/` klasörü)
| Dosya | Boyut | Kullanım Alanı |
|-------|-------|----------------|
| `icon.png` | 512x512 | Windows Electron ikonu |
| `icon.ico` | Multi-size | Windows .exe dosyası (16-256px) |
| `icon-1024.png` | 1024x1024 | macOS .app ikonu (electron-builder ICNS'e çevirir) |
| `logo.svg` | Vektör | Kaynak dosya |

### 📱 Google Play Store (`public/` klasörü)
| Dosya | Boyut | Kullanım Alanı |
|-------|-------|----------------|
| `logo-512.png` | 512x512 | Uygulama ikonu |
| `feature-graphic.png` | 1024x500 | Play Store banner (öne çıkan görsel) |
| `feature-graphic.svg` | 1024x500 | Feature graphic kaynak dosyası |

---

## 🎯 Platform Bazında Kullanım

### ✅ Web Sitesi
- **Favicon**: `favicon.ico`
- **Apple Touch Icon**: `logo-192.png`
- **Logo**: `logo.svg` (vektör) veya `logo-512.png`
- **Zaten entegre**: `public/index.html` ve `public/manifest.json` güncel

### ✅ Google Play Store
1. **Uygulama İkonu**: `public/logo-512.png` yükle
2. **Öne Çıkan Görsel**: `public/feature-graphic.png` yükle
3. **Ekran Görüntüleri**: Uygulamadan screenshot al

### ✅ Microsoft Store
1. **App Icon (512x512)**: `public/logo-512.png`
2. **Logo (300x300)**: `public/logo-300.png`
3. **Tile 44x44**: `public/logo-50.png`
4. **Tile 150x150**: `public/logo-150.png`
5. **Tile 310x310**: `public/logo-310.png`

### ✅ Windows Desktop (.exe)
- **Icon**: `assets/icon.ico` (otomatik, electron-builder kullanır)
- **Multi-size**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256 içerir

### ✅ macOS Desktop (.app)
- **Icon**: `assets/icon-1024.png`
- **electron-builder**: Build sırasında otomatik ICNS oluşturur
- **Gerekli boyutlar**: 1024x1024 PNG yeterli

### ✅ Linux Desktop
- **Icon**: `assets/icon.png` (512x512)
- **AppImage/Snap/Deb**: Otomatik kullanılır

---

## 🎨 Logo Tasarım Detayları

### Konsept
- **Sol Frame**: Giriş görüntüsü (dönüştürülecek)
- **Ok + Parıltılar**: Dönüşüm süreci
- **Sağ Frame**: Geliştirilmiş çıktı (kalite rozeti ile)

### Renkler
| Renk | Hex Kod | Kullanım |
|------|---------|----------|
| Birincil Mavi | `#3B82F6` | Ana gradyan, çerçeveler |
| Koyu Mavi | `#2563EB` | Gradyan bitiş, gölgeler |
| Açık Mavi | `#60A5FA` | Parıltılar, vurgular |
| Gök Mavisi | `#93C5FD` | İkincil parıltılar |
| Yeşil | `#10B981` | Kalite rozeti (başarı) |

### Özellikler
- ✨ Modern gradyan tasarım
- 🖼️ Çift çerçeve (giriş → çıkış)
- ⚡ Animasyonlu dönüşüm oku
- ✅ Kalite göstergesi (yeşil rozet)
- 📐 Vektör tabanlı (her boyuta uyarlanabilir)

---

## 🚀 Build Yapılandırması

### electron-builder.yml
```yaml
win:
  icon: assets/icon.ico  # Windows multi-size ICO

mac:
  icon: assets/icon-1024.png  # macOS (ICNS otomatik oluşturulur)

linux:
  icon: assets/icon.png  # Linux 512x512 PNG
```

### package.json (build config)
```json
{
  "build": {
    "appId": "com.yourcompany.imageconverter",
    "productName": "Image Converter",
    "win": {
      "icon": "assets/icon.ico"
    },
    "mac": {
      "icon": "assets/icon-1024.png"
    },
    "linux": {
      "icon": "assets/icon.png",
      "category": "Graphics"
    }
  }
}
```

---

## 📋 Kontrol Listesi

### ✅ Tamamlanan
- [x] SVG kaynak dosya (`logo.svg`)
- [x] Web favicon (32x32 ICO)
- [x] PWA ikonları (512, 192, 64 PNG)
- [x] Microsoft Store logoları (50, 150, 300, 310 PNG)
- [x] Windows multi-size ICO (16-256px)
- [x] macOS yüksek çözünürlük PNG (1024x1024)
- [x] Play Store feature graphic (1024x500 PNG + SVG)
- [x] HTML entegrasyonu (`index.html`)
- [x] PWA manifest entegrasyonu (`manifest.json`)
- [x] Electron asset entegrasyonu (`assets/`)

### 🎯 Kullanıma Hazır
Tüm logo formatları oluşturuldu ve kullanıma hazır!

---

## 💡 İpuçları

### Logo Önizleme
- **Tarayıcı**: http://localhost:3000/logo-preview.html
- **Dosya**: `public/logo-preview.html` (tüm varyantları gösterir)

### Özelleştirme
- **Renk değişikliği**: `logo.svg` ve `feature-graphic.svg` dosyalarını düzenle
- **Yeniden oluştur**: ImageMagick komutlarını tekrar çalıştır
- **Kaynak**: SVG dosyaları vektör, her boyuta uyarlanabilir

### Store Yükleme Sırası
1. **Google Play**: App icon (512) + Feature graphic (1024x500)
2. **Microsoft Store**: Tüm tile boyutları (50-512)
3. **Web**: Favicon ve PWA ikonları (zaten entegre)
4. **Desktop**: Build sırasında otomatik

---

## 📞 Yardım

Logo dosyalarıyla ilgili sorun yaşarsanız:
1. SVG kaynak dosyalarını kontrol edin (`logo.svg`, `feature-graphic.svg`)
2. ImageMagick komutlarını tekrar çalıştırın
3. Boyutların doğru olduğundan emin olun
4. Transparanlık için `-background none` kullanın

**Tüm logolar profesyonel kalitede ve platformlar arası uyumludur!** 🎉
