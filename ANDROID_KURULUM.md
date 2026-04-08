# Android Uygulama Kurulum Rehberi

## 🚀 Hızlı Başlangıç: React Native ile Android

### 1. Yeni Proje Oluştur

```bash
npx react-native init GorselDonusturucuMobile
cd GorselDonusturucuMobile
```

### 2. Gerekli Paketleri Yükle

```bash
# Görüntü işleme
npm install react-native-image-resizer
npm install react-native-fs
npm install @react-native-community/cameraroll

# UI
npm install react-native-paper
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# State (Desktop ile aynı!)
npm install zustand

# Ödeme (In-App Purchase)
npm install react-native-iap

# Diğer
npm install react-native-image-picker
```

### 3. Paylaşılabilir Kod

Desktop'tan şu dosyaları kopyalayın:
```
src/store/useAppStore.js  → Aynen kullanın!
```

### 4. Android Build

```bash
# Debug APK
cd android
./gradlew assembleDebug

# Release APK (Play Store için)
./gradlew assembleRelease
```

**Çıktı:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### 5. Google Play Store'da Yayınlama

1. **Google Play Console hesabı** açın ($25 tek seferlik)
2. **Uygulama oluşturun**
3. **APK/AAB yükleyin**
4. **Fiyat belirleyin** (Ücretsiz + In-App Purchase)
5. **Yayınlayın**

**Kullanıcılar için:**
```
Google Play Store → "Görsel Dönüştürücü" ara → İndir
```

### 6. APK Direkt Dağıtım (Play Store dışında)

```
www.gorseldonusturucu.com/indir/android
→ app-release.apk indir
→ "Bilinmeyen kaynaklar" izni gerekir
```

---

## 📦 APK Boyutu

- **Minimum**: ~20 MB (temel özellikler)
- **Ortalama**: ~35 MB (tüm özellikler + kütüphaneler)

## 🔄 Güncelleme

### Play Store:
- Otomatik güncelleme
- Version code artır + yeni APK yükle

### Direkt APK:
- Manuel kontrol gerekli
- CodePush entegrasyonu eklenebilir

---

## 💰 Monetizasyon (Android)

### In-App Purchase Kurulumu

```javascript
import * as RNIap from 'react-native-iap';

// Ürünleri tanımla
const productIds = [
  'premium_monthly',  // ₺49.99
  'premium_yearly',   // ₺399.99
];

// Ürünleri getir
const products = await RNIap.getProducts(productIds);

// Satın alma
const purchase = await RNIap.requestPurchase('premium_monthly');

// Doğrulama (Backend'de)
await validatePurchase(purchase);
```

### Google Play Billing Komisyonu
- İlk $1M: %15
- Sonrası: %30

---

## 📊 Tahmini Timeline

| Hafta | Görev |
|-------|-------|
| 1 | React Native kurulum, temel UI |
| 2 | Görüntü işleme entegrasyonu |
| 3 | State management, navigasyon |
| 4 | In-App Purchase, test |
| 5 | Beta test, düzeltmeler |
| 6 | Play Store yayını |

---

## ✅ Kontrol Listesi

- [ ] React Native projesi oluşturuldu
- [ ] Gerekli paketler yüklendi
- [ ] UI tasarımı tamamlandı
- [ ] Görüntü işleme çalışıyor
- [ ] In-App Purchase entegre edildi
- [ ] App icon ve splash screen eklendi
- [ ] Release APK oluşturuldu
- [ ] Google Play Developer hesabı açıldı
- [ ] Store listing hazırlandı (ekran görüntüleri, açıklama)
- [ ] İlk sürüm yayınlandı

---

## 🎯 Minimum Viable Product (MVP)

İlk sürüm için bunlar yeterli:
- ✅ Görsel yükleme (galeri)
- ✅ Format dönüştürme (JPG, PNG, WebP)
- ✅ Kalite ayarı
- ✅ Kaydetme
- ✅ 5 ücretsiz + Premium

Gelişmiş özellikler sonra eklenebilir:
- Toplu işlem
- CMYK dönüşüm
- Hedef boyut
- Renk düzenleme

---

## 📱 Alternatif: PWA (Progressive Web App)

Daha hızlı çözüm:
```bash
# Manifest.json ekle
# Service Worker ekle
# Deploy et

www.gorseldonusturucu.com
→ "Ana ekrana ekle" → Uygulama gibi çalışır
```

**Artıları:**
- Çok hızlı (1 hafta)
- Tek kod (web + mobil)
- Store komisyonu yok

**Eksileri:**
- App Store/Play Store'da yok
- Sınırlı native özellikler
- Daha az güvenilir görünüm

---

## 💡 Tavsiye

1. **Önce Desktop'ı yayınlayın** (hazır zaten)
2. **Kullanıcı geri bildirimi toplayın**
3. **Sonra Android geliştirin** (talep varsa)
4. **PWA ile hızlı prototip** yapabilirsiniz

Android geliştirme isteğiniz kesinleşirse detaylı kod örnekleri ve tam entegrasyon desteği verebilirim!
