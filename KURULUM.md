# Kurulum ve Çalıştırma Kılavuzu

## Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
cd GorselDonusturucu
npm install
```

Bu işlem birkaç dakika sürebilir çünkü Sharp ve Electron gibi büyük paketler yükleniyor.

### 2. Geliştirme Modunda Çalıştırın
```bash
npm run electron-dev
```

Bu komut:
- React development server'ı başlatır (port 3000)
- Electron uygulamasını açar
- Hot-reload ile kod değişikliklerini otomatik yansıtır

### 3. Production Build Oluşturun
```bash
npm run electron-build
```

Bu komut Windows için `.exe` kurulum dosyası oluşturur.

## Olası Sorunlar ve Çözümler

### Sharp Kurulum Hatası

**Sorun**: Native modül derleme hatası

**Çözüm**:
```bash
npm install --global windows-build-tools
npm rebuild sharp
```

### Electron Başlatma Hatası

**Sorun**: Electron bulunamıyor

**Çözüm**:
```bash
npm install electron --save-dev
```

### Port Zaten Kullanımda

**Sorun**: 3000 portu başka bir uygulama tarafından kullanılıyor

**Çözüm**:
```bash
# Windows PowerShell
$env:PORT=3001; npm start

# Veya başka uygulamayı kapatın
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Node Sürümü Uyumsuzluğu

**Sorun**: Node.js sürümü uyumsuz

**Çözüm**: Node.js 18 veya üzeri yükleyin
```bash
node --version  # Sürümü kontrol edin
```

## Geliştirme İpuçları

### 1. Sadece React'i Çalıştırma
Electron olmadan sadece web tarayıcıda test etmek için:
```bash
npm start
```

### 2. Electron Console Açma
Geliştirme sırasında Electron DevTools otomatik açılır. Kapatmak için:
`electron/main.js` içinde bu satırı yoruma alın:
```javascript
// mainWindow.webContents.openDevTools();
```

### 3. State İzleme
Zustand DevTools için browser extension yükleyin:
- [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools)

### 4. Stil Değişiklikleri
Tailwind CSS kullanıyoruz. Değişiklikler otomatik derlenir.

## Test Senaryoları

### Manuel Test Listesi

1. **Dosya Yükleme**
   - [ ] Tek dosya yükleme
   - [ ] Çoklu dosya yükleme
   - [ ] Drag & drop ile yükleme
   - [ ] Geçersiz dosya tipi kontrolü

2. **Format Dönüştürme**
   - [ ] JPG → PNG
   - [ ] PNG → WebP
   - [ ] TIFF → JPG
   - [ ] Her format kombinasyonu

3. **Kalite Ayarları**
   - [ ] Düşük kalite (10-30%)
   - [ ] Orta kalite (40-70%)
   - [ ] Yüksek kalite (80-100%)

4. **Hedef Boyut**
   - [ ] 500 KB hedef
   - [ ] 1 MB hedef
   - [ ] Çok küçük hedef (uyarı kontrolü)

5. **Renk Dönüşümü**
   - [ ] CMYK → RGB
   - [ ] RGB → CMYK
   - [ ] Renk doğruluğu görsel kontrolü

6. **Toplu İşlem**
   - [ ] 5 dosya toplu dönüştürme
   - [ ] 20+ dosya toplu dönüştürme
   - [ ] İlerleme çubuğu kontrolü

7. **Lisans Sistemi**
   - [ ] Ücretsiz limit kontrolü (5 dönüşüm)
   - [ ] Limit dolduğunda uyarı
   - [ ] Premium aktivasyon
   - [ ] Premium sonrası sınırsız kullanım

8. **İstatistikler**
   - [ ] Toplam dönüşüm sayacı
   - [ ] Tasarruf edilen boyut hesabı
   - [ ] Ortalama sıkıştırma oranı

## Performance İyileştirmeleri

### Önerilen Optimizasyonlar

1. **Büyük Dosyalar için Worker Kullanımı**
   Çok büyük dosyalar için Web Worker kullanarak UI thread'i bloklamayın.

2. **Lazy Loading**
   Büyük bileşenleri lazy load edin:
   ```javascript
   const LicenseModal = React.lazy(() => import('./components/LicenseModal'));
   ```

3. **Memoization**
   Yoğun hesaplamalar için `useMemo` kullanın:
   ```javascript
   const fileStats = useMemo(() => calculateStats(files), [files]);
   ```

4. **Virtual Scrolling**
   Çok sayıda dosya için react-window kullanın.

## Deployment

### Windows EXE Oluşturma
```bash
npm run electron-build
```
Çıktı: `dist/Görsel Dönüştürücü Setup x.x.x.exe`

### macOS DMG Oluşturma
```bash
npm run electron-build -- --mac
```

### Linux AppImage Oluşturma
```bash
npm run electron-build -- --linux
```

### Auto-Update Yapılandırması
`electron-builder.yml` dosyasında publish ayarlarını yapılandırın.

## Güvenlik

### Önemli Notlar
- `nodeIntegration: false` - Her zaman kapalı
- `contextIsolation: true` - Her zaman açık
- Preload script kullanarak güvenli API sağlayın
- Kullanıcı input'larını validate edin

## Lisans Entegrasyonu

### Stripe Entegrasyonu (Opsiyonel)

1. Stripe hesabı oluşturun
2. API anahtarlarını alın
3. `.env` dosyası oluşturun:
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

4. Backend API oluşturun (express.js örneği ayrı dokümanda)

## Destek

Sorun yaşıyorsanız:
1. Console loglarını kontrol edin (F12)
2. `npm-debug.log` dosyasını inceleyin
3. Issue açın veya destek@gorseldonusturucu.com adresine yazın

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır! Lütfen:
- Kod stiline uyun
- Test senaryolarını çalıştırın
- Açıklayıcı commit mesajları yazın

---

**İyi Çalışmalar! 🚀**
