# Ödeme Sistemi Entegrasyon Rehberi

## 💳 Stripe Entegrasyonu (Önerilen)

### Neden Stripe?
- ✅ Türkiye destekli
- ✅ Kolay entegrasyon
- ✅ Abonelik yönetimi
- ✅ %2.9 + ₺0.90 komisyon
- ✅ TL desteği

---

## 🚀 Adım Adım Kurulum

### 1. Stripe Hesabı Oluştur

```
1. https://stripe.com/tr → Kayıt ol
2. Hesabı doğrula (kimlik, banka bilgileri)
3. API anahtarlarını al:
   - Test: pk_test_xxxxx, sk_test_xxxxx
   - Canlı: pk_live_xxxxx, sk_live_xxxxx
```

### 2. Ürünleri Stripe'da Oluştur

```javascript
// Stripe Dashboard'da:
Products → Create Product

Ürün 1: Premium Aylık
- Fiyat: ₺49.99 / ay
- Recurring: Monthly
- ID: price_xxxxx_monthly

Ürün 2: Premium Yıllık  
- Fiyat: ₺399.99 / yıl
- Recurring: Yearly
- ID: price_xxxxx_yearly
```

### 3. Backend Servisi Oluştur (Node.js)

Electron uygulamanız için basit bir backend:

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')('sk_test_xxxxxxxxxxxxx');
const app = express();

app.use(express.json());

// Ödeme niyeti oluştur
app.post('/create-payment-intent', async (req, res) => {
  const { priceId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        app: 'GorselDonusturucu'
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Abonelik doğrulama
app.post('/verify-subscription', async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    res.json({
      active: subscription.status === 'active',
      expiryDate: new Date(subscription.current_period_end * 1000),
      licenseKey: `GD-${subscription.id.slice(-12)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Backend çalışıyor: http://localhost:3001'));
```

### 4. Electron Ana Sürecinde API Ekle

```javascript
// electron/main.js

// Stripe ödeme başlat
ipcMain.handle('payment:start', async (event, planType) => {
  const priceIds = {
    monthly: 'price_xxxxx_monthly',
    yearly: 'price_xxxxx_yearly'
  };
  
  try {
    // Backend'e istek at
    const response = await fetch('http://localhost:3001/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: priceIds[planType] })
    });
    
    const { url } = await response.json();
    
    // Stripe ödeme sayfasını aç
    shell.openExternal(url);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Ödeme doğrulama
ipcMain.handle('payment:verify', async (event, sessionId) => {
  try {
    const response = await fetch('http://localhost:3001/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    
    const data = await response.json();
    
    if (data.active) {
      // Lisansı kaydet
      store.set('licenseKey', data.licenseKey);
      store.set('licenseExpiry', data.expiryDate);
      store.set('activatedAt', new Date().toISOString());
    }
    
    return data;
  } catch (error) {
    return { active: false, error: error.message };
  }
});
```

### 5. Preload.js'e Ekle

```javascript
// electron/preload.js

contextBridge.exposeInMainWorld('electronAPI', {
  // Mevcut API'ler...
  
  // Ödeme API'leri
  startPayment: (planType) => ipcRenderer.invoke('payment:start', planType),
  verifyPayment: (sessionId) => ipcRenderer.invoke('payment:verify', sessionId),
});
```

### 6. LicenseModal.js'i Güncelle

```javascript
// src/components/LicenseModal.js

const handlePurchase = async () => {
  setIsProcessing(true);
  
  try {
    // Stripe ödeme sayfasını aç
    const result = await window.electronAPI.startPayment(selectedPlan);
    
    if (result.success) {
      addNotification({
        type: 'info',
        title: 'Ödeme Sayfası Açıldı',
        message: 'Tarayıcınızda Stripe ödeme sayfası açıldı. Ödemeyi tamamlayın.'
      });
      
      // Kullanıcı ödemeyi tamamladığında Success sayfasına yönlendirilecek
      // Bu sayfada session_id alınıp doğrulama yapılacak
    }
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Ödeme Hatası',
      message: error.message
    });
  } finally {
    setIsProcessing(false);
  }
};
```

### 7. Success Sayfası Ekle

```javascript
// src/pages/Success.js

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Success = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);
  
  const verifyPayment = async (sessionId) => {
    const result = await window.electronAPI.verifyPayment(sessionId);
    
    if (result.active) {
      // Başarılı!
      window.close(); // Tarayıcıyı kapat
      // Electron uygulamasına bildirim gönder
    }
  };
  
  return (
    <div className="success-page">
      <h1>✅ Ödeme Başarılı!</h1>
      <p>Premium hesabınız aktifleştirildi.</p>
      <p>Bu pencereyi kapatabilirsiniz.</p>
    </div>
  );
};
```

---

## 🌐 Alternatif: WebView İçinde Ödeme

Daha entegre bir çözüm:

```javascript
// electron/main.js

let paymentWindow;

ipcMain.handle('payment:showWindow', async (event, planType) => {
  paymentWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false
    }
  });
  
  // Stripe Checkout URL'i yükle
  const checkoutUrl = await createStripeCheckout(planType);
  paymentWindow.loadURL(checkoutUrl);
  
  // Ödeme tamamlandığında kontrol et
  paymentWindow.webContents.on('did-navigate', (event, url) => {
    if (url.includes('success')) {
      const sessionId = new URL(url).searchParams.get('session_id');
      verifyAndActivate(sessionId);
      paymentWindow.close();
    }
  });
});
```

---

## 💰 Diğer Ödeme Seçenekleri

### 1. iyzico (Türkiye'ye Özel)
- %2.5-3% komisyon
- TL desteği mükemmel
- Havale/EFT seçeneği

### 2. PayPal
- Global kullanıcılar için
- %4.4 + sabit ücret
- Abonelik desteği iyi

### 3. Kripto Para
- BTCPay Server
- Komisyon yok
- Teknik bilgi gerekli

### 4. Manual (Havale/EFT)
- Komisyon yok
- Manuel onay gerekir
- Daha az profesyonel

---

## 📊 Fiyatlandırma Stratejisi

### Önerilen Fiyatlar (Türkiye):

```
Ücretsiz: 5 dönüştürme
├─ Aylık: ₺49.99
│  └─ Hedef: Düzenli kullanıcılar
│
└─ Yıllık: ₺399.99 (%33 indirim)
   └─ Hedef: Profesyoneller
```

### Global Fiyatlar:

```
Ücretsiz: 5 dönüştürme
├─ Aylık: $4.99
└─ Yıllık: $39.99
```

---

## 🔒 Lisans Doğrulama Sistemi

### Basit Lisans Sistemi:

```javascript
// Lisans formatı: GD-XXXXXXXXXXXX

function generateLicense(subscriptionId) {
  const prefix = 'GD';
  const hash = subscriptionId.slice(-12).toUpperCase();
  return `${prefix}-${hash}`;
}

function validateLicense(licenseKey) {
  // Backend'den doğrula
  // Stripe subscription durumunu kontrol et
  // Aktif mi? Süresi dolmuş mu?
}
```

### Gelişmiş Lisans (Hardware-locked):

```javascript
const machineId = require('node-machine-id');

// Cihaza özel lisans
const deviceId = machineId.machineIdSync();
const license = generateLicense(subscriptionId, deviceId);

// Tek cihazda kullanım
// Farklı cihazda login gerekir
```

---

## 📱 Android In-App Purchase

```javascript
import * as RNIap from 'react-native-iap';

// Google Play Console'da ürün oluştur
const productIds = ['premium_monthly', 'premium_yearly'];

// Satın alma
const purchase = await RNIap.requestSubscription('premium_monthly');

// Backend'de doğrula
await fetch('https://yourapi.com/verify-android-purchase', {
  method: 'POST',
  body: JSON.stringify({
    purchaseToken: purchase.purchaseToken,
    productId: purchase.productId
  })
});
```

---

## ✅ Test Modu

Geliştirme sırasında:

```javascript
// electron/main.js

const IS_DEV = process.env.NODE_ENV === 'development';

ipcMain.handle('license:check', async () => {
  if (IS_DEV) {
    // Test modunda herkese premium ver
    return {
      hasLicense: true,
      isActive: true,
      canUse: true
    };
  }
  
  // Production'da gerçek kontrol
  // ...
});
```

---

## 🎯 Uygulama Planı

1. ✅ **Backend servisi deploy et** (Heroku, Vercel, Railway)
2. ✅ **Stripe hesabı aktifleştir**
3. ✅ **Test ödemeleri yap** (Test kartları kullan)
4. ✅ **Prod'a geç**
5. ✅ **İlk gerçek satış!** 🎉

---

## 💡 Hızlı Başlangıç

Test için minimal setup:

```bash
# Backend
npm install express stripe cors

# .env dosyası
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Çalıştır
node server.js
```

Detaylı entegrasyon için backend kodlarını hazırlamamı ister misiniz?
