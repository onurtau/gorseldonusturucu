# Android Uygulaması İçin Rehber

Masaüstü uygulamanız hazır. Şimdi Android'e taşıma için iki yöntem:

## Yöntem 1: React Native Bridge (Önerilen)

### Neden React Native?
- Mevcut React kodunuzun %60-70'ini yeniden kullanabilirsiniz
- Native performans
- App Store ve Google Play'de yayınlama

### Gerekli Adımlar

1. **Yeni React Native Projesi**
```bash
npx react-native init GorselDonusturucuMobile
cd GorselDonusturucuMobile
```

2. **Gerekli Kütüphaneler**
```bash
# Görüntü işleme
npm install react-native-image-resizer
npm install react-native-fs
npm install @react-native-community/cameraroll

# UI bileşenleri
npm install react-native-paper
npm install react-navigation @react-navigation/native @react-navigation/stack

# State management (aynı Zustand)
npm install zustand

# Ödeme sistemi
npm install @stripe/stripe-react-native
```

3. **Paylaşılabilir Kod**

Şu dosyaları direkt kullanabilirsiniz:
- `src/store/useAppStore.js` (State management)
- `src/utils/*` (Utility fonksiyonları)

Uyarlanması gerekenler:
- UI bileşenleri (Tailwind → React Native StyleSheet)
- Electron API çağrıları → Native modüller

### Örnek Dönüşüm

**Masaüstü (React + Tailwind):**
```jsx
<div className="bg-dark-800 rounded-xl p-4">
  <button className="bg-primary-500 text-white px-4 py-2 rounded-lg">
    Dönüştür
  </button>
</div>
```

**Mobile (React Native):**
```jsx
<View style={styles.container}>
  <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Dönüştür</Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
```

## Yöntem 2: Progressive Web App (PWA)

Daha hızlı bir çözüm için uygulamanızı PWA'ya çevirebilirsiniz:

### Avantajları
- Kod değişikliği minimal
- Hem Android hem iOS
- Deploy kolay (web hosting)

### Dezavantajları
- App Store'larda yok
- Sınırlı native özellikler
- Performans React Native'den düşük

### PWA Yapılandırması

1. **Service Worker Ekle**
```bash
npm install workbox-webpack-plugin
```

2. **manifest.json Güncelle**
```json
{
  "short_name": "Görsel Dönüştürücü",
  "name": "Görsel Dönüştürücü - Profesyonel",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#0f172a"
}
```

## Özellik Karşılaştırması

| Özellik | Electron (Desktop) | React Native | PWA |
|---------|-------------------|--------------|-----|
| Geliştirme Hızı | ✅ Hızlı | ⚠️ Orta | ✅ Çok Hızlı |
| Performans | ✅ Çok İyi | ✅ Çok İyi | ⚠️ İyi |
| Native Erişim | ✅ Tam | ✅ Tam | ❌ Sınırlı |
| App Store | ✅ Evet | ✅ Evet | ❌ Hayır |
| Dosya Sistemi | ✅ Tam | ⚠️ Kısıtlı | ❌ Çok Kısıtlı |
| Offline Çalışma | ✅ Evet | ✅ Evet | ⚠️ Sınırlı |
| Güncelleme | Auto-update | App Store | 🔄 Otomatik |

## Android İçin Özel Özellikler

### 1. Cihaz Galerisi Entegrasyonu
```javascript
import { CameraRoll } from '@react-native-community/cameraroll';

// Galeriden resim seç
const pickImage = async () => {
  const result = await CameraRoll.getPhotos({
    first: 20,
    assetType: 'Photos',
  });
  // ...
};
```

### 2. Hedef Klasör Seçimi
```javascript
import RNFS from 'react-native-fs';

// Dönüştürülmüş dosyayı kaydet
const saveConvertedImage = async (base64Data, filename) => {
  const path = `${RNFS.PicturesDirectoryPath}/GorselDonusturucu/${filename}`;
  await RNFS.writeFile(path, base64Data, 'base64');
};
```

### 3. Arka Plan İşleme
```javascript
import BackgroundService from 'react-native-background-actions';

// Toplu dönüştürme için arka plan servisi
const backgroundTask = async (taskData) => {
  await BackgroundService.start(taskData);
  // Dönüştürme işlemleri...
  await BackgroundService.stop();
};
```

## Monetizasyon - Android

### In-App Purchase (IAP)
```bash
npm install react-native-iap
```

```javascript
import * as RNIap from 'react-native-iap';

const products = await RNIap.getProducts(['premium_monthly', 'premium_yearly']);

// Satın alma
const purchase = await RNIap.requestPurchase('premium_monthly');
```

### Google Play Billing
- Aylık abonelik: 49.99 TL
- Yıllık abonelik: 399.99 TL
- %15-30 Google komisyonu

## Tavsiye Edilen Mimari

```
📱 Mobile App (React Native)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── ConvertScreen.js
│   │   ├── BatchScreen.js
│   │   └── SettingsScreen.js
│   ├── components/
│   │   ├── ImagePicker.js
│   │   ├── ConversionOptions.js
│   │   └── ProgressBar.js
│   ├── services/
│   │   ├── imageProcessor.js  # Native bridge
│   │   └── storageService.js
│   ├── store/
│   │   └── useAppStore.js  # Shared from desktop!
│   └── navigation/
│       └── AppNavigator.js
```

## Geliştirme Timeline

| Hafta | Görev |
|-------|-------|
| 1 | React Native kurulum, temel ekranlar |
| 2 | Görüntü işleme native modülü |
| 3 | UI/UX tamamlama, state management |
| 4 | IAP entegrasyonu, test |
| 5 | Beta test, bug fix |
| 6 | Google Play yayını |

## Sonuç

**Önerimiz**: React Native ile başlayın çünkü:
- ✅ Mevcut kodunuzu kullanabilirsiniz
- ✅ Native performans
- ✅ App Store'da yer alır
- ✅ Tam özellik desteği

**Alternatif**: Hızlı prototip için PWA, sonra React Native'e geçiş

## İletişim

Android geliştirme desteği için: mobile@gorseldonusturucu.com

---

**Başarılar! 📱**
