# Görsel Dönüştürücü - Profesyonel Görüntü İşleme Uygulaması

Modern, güçlü ve kullanıcı dostu bir masaüstü görsel dönüştürme uygulaması.

## 🎯 Özellikler

### Temel Özellikler
- ✅ **Format Dönüştürme**: JPG, PNG, WebP, TIFF, BMP ve daha fazlası
- ✅ **Akıllı Sıkıştırma**: Dosya boyutunu pixel oranını bozmadan küçültme
- ✅ **Renk Uzayı Dönüşümü**: 
  - CMYK → RGB (Profesyonel ICC profil desteği)
  - RGB → CMYK (Temel dönüşüm)
- ✅ **Toplu İşlem**: Birden fazla dosyayı aynı anda dönüştürme
- ✅ **Metadata Koruma**: EXIF ve renk profil bilgilerini koruma
- ✅ **Kalite Kontrolü**: Özelleştirilebilir kalite ayarları

### Premium Özellikler
- 🌟 Sınırsız dönüştürme
- 🌟 Tüm format ve özellikler
- 🌟 Öncelikli destek
- 🌟 Otomatik güncellemeler

## 🛠️ Teknolojiler

- **Frontend**: React 18 + Tailwind CSS
- **Desktop**: Electron
- **State Management**: Zustand
- **Görüntü İşleme**: Sharp, ImageMagick
- **UI Animasyonlar**: Framer Motion
- **İkonlar**: Lucide React

## 📦 Kurulum

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn

### Kurulum Adımları

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run electron-dev

# Production build oluştur
npm run electron-build
```

## 🚀 Kullanım

1. **Dosya Yükle**: Dosyaları sürükle-bırak veya "Dosya Seç" butonuyla yükleyin
2. **Ayarları Yapılandır**: 
   - Çıktı formatı seçin
   - Kalite ayarını yapın
   - İsteğe bağlı hedef dosya boyutu belirleyin
   - Renk uzayı dönüşümü seçin
3. **Dönüştür**: Tek veya toplu dönüşüm başlatın

## 📁 Proje Yapısı

```
GorselDonusturucu/
├── electron/
│   ├── main.js          # Electron ana süreç
│   └── preload.js       # Preload scripti
├── src/
│   ├── components/      # React bileşenleri
│   │   ├── Header.js
│   │   ├── FileUploadZone.js
│   │   ├── FileList.js
│   │   ├── ConversionPanel.js
│   │   ├── StatsPanel.js
│   │   ├── LicenseModal.js
│   │   └── NotificationContainer.js
│   ├── store/
│   │   └── useAppStore.js  # Zustand state management
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── assets/              # Uygulama ikonları
├── package.json
└── README.md
```

## 🎨 Özellik Detayları

### Format Dönüştürme
Desteklenen çıktı formatları:
- JPEG (.jpg)
- PNG (.png)
- WebP (.webp)
- TIFF (.tiff)
- BMP (.bmp)

### Boyut Optimizasyonu
- Kalite tabanlı sıkıştırma (10-100%)
- Hedef dosya boyutu ile otomatik sıkıştırma
- Pixel oranı korunur (aspect ratio)

### Renk Yönetimi
- **CMYK → RGB**: ICC profil kullanarak profesyonel dönüşüm
- **RGB → CMYK**: Temel dönüşüm desteği
- Renk kalibrasyonu korunur
- Metadata (EXIF, IPTC) korunur

### Toplu İşlem
- Birden fazla dosyayı aynı anda işleme
- İlerleme takibi
- Dosya bazında sonuç raporları

## 💰 Lisanslama

### Ücretsiz Sürüm
- 5 dönüştürme hakkı
- Tüm temel özellikler

### Premium Sürümler

**Aylık Plan**: ₺49.99/ay
- Sınırsız dönüştürme
- Tüm özellikler

**Yıllık Plan**: ₺399.99/yıl (%33 tasarruf)
- Sınırsız dönüştürme
- Tüm özellikler
- 2 ay hediye

## 🔐 Güvenlik

- Tüm işlemler yerel olarak gerçekleşir
- Dosyalarınız sunucuya yüklenmez
- Ödeme bilgileri SSL ile şifrelenir
- Kart bilgileri saklanmaz

## 📊 İstatistikler

Uygulama içinde şu istatistikleri takip edebilirsiniz:
- Toplam dönüştürülen dosya sayısı
- Tasarruf edilen dosya boyutu
- Ortalama sıkıştırma oranı

## 🐛 Sorun Giderme

### Electron başlatma hatası
```bash
npm install electron --save-dev
```

### Sharp yükleme hatası
```bash
npm rebuild sharp
```

### Port zaten kullanımda
React development server varsayılan olarak 3000 portunu kullanır. Değiştirmek için:
```bash
PORT=3001 npm start
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje özel lisans altındadır. Ticari kullanım için lisans gereklidir.

## 📧 İletişim

Destek için: destek@gorseldonusturucu.com

## 🙏 Teşekkürler

- Sharp - Hızlı görüntü işleme
- Electron - Cross-platform masaüstü uygulaması
- React - UI framework
- Tailwind CSS - Styling

---

**Not**: Bu uygulama Windows, macOS ve Linux işletim sistemlerinde çalışır.
