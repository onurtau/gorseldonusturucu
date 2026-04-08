# Görsel Dönüştürücü - Web & Desktop Versiyonu

Profesyonel görsel dönüştürme ve optimizasyon uygulaması. Hem masaüstü (Electron) hem de web tarayıcı desteği.

## 🚀 Özellikler

### Platform Desteği
- ✅ **Desktop (Electron)**: Windows, macOS, Linux
- ✅ **Web**: Tüm modern tarayıcılar

### İşlevler
- 🔄 Format Dönüştürme (JPG, PNG, WebP, AVIF, TIFF)
- 📏 Görsel Boyutlandırma
- 💧 Filigran Ekleme  
- 🎨 Renk Uzayı Dönüştürme
- 📦 Toplu İşleme

### Kullanıcı Sistemleri
- **Web - Kayıtsız Kullanıcılar**: 3 ücretsiz deneme
- **Web - Kayıtlı Kullanıcılar**: Free tier limitleri
- **Web - Premium Kullanıcılar**: Sınırsız kullanım
- **Desktop**: Tam özellikli offline kullanım

## 📦 Kurulum

### Backend API (Web için gerekli)

```bash
cd backend
npm install
npm start
```

Backend varsayılan olarak `http://localhost:5000` adresinde çalışır.

### Frontend

#### Web Versiyonu

```bash
npm install
npm run start:web
```

Web versiyonu `http://localhost:3000` adresinde açılır.

#### Desktop Versiyonu (Electron)

```bash
npm install
npm run electron-dev
```

## 🔧 Environment Ayarları

### `.env.web` (Web Development)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PLATFORM=web
```

### `.env.web.production` (Web Production)
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_PLATFORM=web
```

### `.env.electron` (Desktop)
```env
REACT_APP_PLATFORM=electron
```

## 🏗️ Build

### Web Versiyonu Build

```bash
npm run build:web
```

Build çıktısı `build/` klasöründe oluşur. Netlify, Vercel veya benzeri platformlara deploy edilebilir.

### Desktop Versiyonu Build

```bash
npm run electron-build
```

Çalıştırılabilir dosya `release/` klasöründe oluşur.

## 🗂️ Proje Yapısı

```
GorselDonusturucu/
├── backend/              # Backend API (Node.js + Express + Sharp)
│   ├── server.js         # Ana server dosyası
│   ├── package.json      # Backend dependencies
│   └── .env              # Backend environment
├── src/
│   ├── services/
│   │   ├── imageProcessor.js    # Platform-agnostic image processing
│   │   └── trialManager.js      # Trial/premium control
│   ├── pages/                   # React sayfaları
│   ├── components/              # React komponentleri
│   └── store/                   # Zustand state management
├── electron/             # Electron main process
├── public/               # Public assets
└── package.json          # Frontend dependencies
```

## 🔌 API Endpoints

### Backend API (Port: 5000)

- `GET /api/health` - Sağlık kontrolü
- `POST /api/convert` - Format dönüştürme
- `POST /api/resize` - Görsel boyutlandırma
- `POST /api/watermark` - Filigran ekleme
- `POST /api/colorspace` - Renk uzayı dönüştürme
- `POST /api/batch` - Toplu işleme

## 🧪 Test

### Backend Test
```bash
cd backend
npm start
# Browser'da: http://localhost:5000/api/health
```

### Frontend Test

**Web Modunda:**
```bash
npm run start:web
# Browser'da: http://localhost:3000
```

**Desktop Modunda:**
```bash
npm run electron-dev
```

## 🎯 Platform Detection

Uygulama otomatik olarak platformu algılar:

```javascript
import { isElectron, getPlatform } from './services/imageProcessor';

if (isElectron) {
  // Electron API kullan
  await window.electronAPI.convertImage(...);
} else {
  // Backend API kullan
  await fetch('/api/convert', ...);
}
```

## 💡 Kullanım Örnekleri

### Web Versiyonu - Kayıtsız Kullanıcı
1. Tarayıcıda aç: `http://localhost:3000`
2. Dosya yükle (drag & drop veya seç)
3. İşlem yap (3 deneme hakkı)
4. İşlenmiş dosya otomatik indirilir

### Web Versiyonu - Kayıtlı Kullanıcı
1. Kayıt ol / Giriş yap
2. Free tier veya premium ile kullan
3. Kullanım limitlerini takip et

### Desktop Versiyonu
1. Uygulamayı aç
2. Dosya seç (file browser)
3. İşlem yap
4. Kaydetme konumu seç
5. Offline çalışır

## 📊 Trial Sistemi (Web)

Web versiyonunda kayıtsız kullanıcılar için:
- ✅ İlk 3 dönüşüm ücretsiz
- 💾 localStorage ile tracking
- 🔔 Kalan hak bildirimi
- 🔐 Limit dolunca kayıt yönlendirmesi

## 🛠️ Geliştirme

### Yeni Bir İşlem Ekleme

1. **Backend**: `backend/server.js`'e endpoint ekle
2. **Frontend**: `src/services/imageProcessor.js`'e fonksiyon ekle
3. **UI**: İlgili sayfayı oluştur/güncelle

### Platform-Agnostic Kod Yazma

```javascript
// ✅ Doğru
import { convertImage } from '../services/imageProcessor';
const result = await convertImage(file, options);

// ❌ Yanlış
const result = await window.electronAPI.convertImage(...);
```

## 📝 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 🐛 Sorun Bildirme

Sorunları GitHub Issues'dan bildirebilirsiniz.

## 📞 İletişim

Sorularınız için: [e-posta adresi]

---

**Not**: Web versiyonu için backend API'nin çalışıyor olması gerekir. Desktop versiyonu offline çalışır.
