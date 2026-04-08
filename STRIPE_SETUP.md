# 🚀 Stripe Entegrasyon Rehberi - Güncellenmiş

## 📋 Genel Bakış

Bu rehber, **GorselDonusturucu** uygulamasına Stripe ödeme sisteminin **lokasyon bazlı fiyatlandırma** ile entegrasyonunu açıklamaktadır.

### 💰 Fiyatlandırma Stratejisi

| Bölge | Fiyat | Currency | Ülkeler |
|-------|-------|----------|---------|
| 🇹🇷 Türkiye | ₺119/ay | TRY | TR |
| 🇪🇺 Avrupa | €3/ay | EUR | AB, EEA, İngiltere, İsviçre, Norveç vb. |
| 🌍 Global | $3/ay | USD | Diğer tüm ülkeler |

---

## 🛠️ Kurulum Adımları

### 1. Stripe Hesabı Oluşturma

1. **https://stripe.com/tr** adresine git
2. **Kayıt ol** butonuna tıkla
3. İş bilgilerini doldur:
   - İş adı: GorselDonusturucu
   - Kategori: Software as a Service
   - Website: (opsiyonel)
4. Email doğrulaması yap
5. **Kimlik doğrulaması** (canlıya geçmek için gerekli):
   - TC kimlik no
   - Adres bilgileri
   - Banka hesabı (ödeme alımları için)

### 2. API Anahtarlarını Alma

#### Test Mod Anahtarları (Geliştirme için)

1. Stripe Dashboard → **Developers** → **API keys**
2. **Viewing test data** toggle'ının açık olduğundan emin ol
3. Anahtarları kopyala:
   - **Publishable key**: `pk_test_...` (frontend için)
   - **Secret key**: `sk_test_...` (backend için - GİZLİ!)

#### .env Dosyasını Güncelle

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 3. Stripe'da Ürün ve Fiyat Oluşturma

#### Türkiye Ürünü (₺119/ay)

1. Stripe Dashboard → **Products** → **Create product**
2. Bilgileri doldur:
   ```
   Name: Premium Subscription - Turkey
   Description: Unlimited access to all features - Turkish pricing
   Pricing model: Recurring
   Price: 119
   Currency: TRY (Turkish Lira)
   Billing period: Monthly
   ```
3. **Save product**
4. **Price ID**'yi kopyala: `price_xxxxxxxxxxxxx`
5. `.env` dosyasına ekle:
   ```
   STRIPE_PRICE_ID_TURKEY=price_xxxxxxxxxxxxx
   ```

#### Avrupa Ürünü (€3/ay)

1. **Create product** → Yeni ürün oluştur
2. Bilgileri doldur:
   ```
   Name: Premium Subscription - Europe
   Description: Unlimited access to all features - European pricing
   Pricing model: Recurring
   Price: 3
   Currency: EUR (Euro)
   Billing period: Monthly
   ```
3. **Save product**
4. **Price ID**'yi kopyala ve `.env`'ye ekle:
   ```
   STRIPE_PRICE_ID_EUROPE=price_xxxxxxxxxxxxx
   ```

#### Global Ürünü ($3/ay)

1. **Create product** → Yeni ürün oluştur
2. Bilgileri doldur:
   ```
   Name: Premium Subscription - Global
   Description: Unlimited access to all features - Global pricing
   Pricing model: Recurring
   Price: 3
   Currency: USD (US Dollar)
   Billing period: Monthly
   ```
3. **Save product**
4. **Price ID**'yi kopyala ve `.env`'ye ekle:
   ```
   STRIPE_PRICE_ID_GLOBAL=price_xxxxxxxxxxxxx
   ```

---

### 4. Webhook Kurulumu (İsteğe Bağlı ama Önerilen)

Webhooks, abonelik durumu değişikliklerini (ödeme başarılı, iptal, vs.) gerçek zamanlı takip etmek için kullanılır.

#### Geliştirme Ortamı (Stripe CLI)

1. **Stripe CLI kur**:
   ```bash
   # Windows
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   ```

2. **Giriş yap**:
   ```bash
   stripe login
   ```

3. **Webhook'u başlat**:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe-webhook
   ```

4. **Webhook secret**'ı kopyala ve `.env`'ye ekle:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Production Ortamı

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint**
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. **Webhook signing secret**'ı kopyala ve production `.env`'ye ekle

---

### 5. Backend Kurulumu

#### Dependencies Yükleme

```bash
cd backend
npm install
```

Yeni eklenen paketler:
- `stripe` - Stripe Node.js SDK
- `geoip-lite` - IP-based ülke tespiti

#### Backend Başlatma

```bash
cd backend
node server.js
```

Kontrol et:
```bash
curl http://localhost:5000/api/health
```

---

### 6. Frontend Kurulumu

Frontend tarafında herhangi bir npm paketi kurulmasına gerek yok. Tüm Stripe işlemleri backend üzerinden yapılıyor.

#### Test Etme

1. **Lokasyon tespiti test**:
   ```bash
   curl http://localhost:5000/api/detect-location
   ```

2. **Frontend başlat**:
   ```bash
   npm start
   ```

3. **Premium butonu test**:
   - Landing page'de Premium section'a git
   - "Premium'a Geç" butonuna tıkla
   - Stripe checkout sayfasına yönlendirilmelisin

---

### 7. Test Kartları

Stripe test modunda bu kartları kullanabilirsiniz:

| Kart Numarası | Sonuç |
|---------------|-------|
| 4242 4242 4242 4242 | ✅ Başarılı ödeme |
| 4000 0000 0000 9995 | ❌ Yetersiz bakiye |
| 4000 0000 0000 0002 | ❌ Kart reddedildi |

Diğer bilgiler (hepsi test için geçerli):
- **Expiry Date**: Herhangi bir gelecek tarih (örn: 12/26)
- **CVC**: Herhangi 3 haneli sayı (örn: 123)
- **ZIP**: Herhangi kod (örn: 12345)

---

### 8. Canlıya Geçiş (Production)

#### a) Stripe Hesabını Aktive Et

1. Kimlik doğrulamasını tamamla
2. Banka hesabı bilgilerini ekle
3. Vergi bilgilerini gir

#### b) Canlı API Anahtarlarını Al

1. Stripe Dashboard → **Developers** → **API keys**
2. **Viewing test data** toggle'ını **kapat**
3. **Live** modda anahtarları kopyala:
   - `pk_live_...`
   - `sk_live_...`

#### c) Production .env Güncelle

```bash
# Production backend/.env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_PRICE_ID_TURKEY=price_xxxxxxxxxxxxx  # Live mode price ID
STRIPE_PRICE_ID_EUROPE=price_xxxxxxxxxxxxx  # Live mode price ID
STRIPE_PRICE_ID_GLOBAL=price_xxxxxxxxxxxxx  # Live mode price ID
```

#### d) Production Ürünleri Oluştur

**Önemli**: Test modda oluşturduğun ürünler canlı modda görünmez! Canlı modda tekrar oluşturman gerekir.

1. Toggle'ı **Live** moduna çek
2. Yukarıdaki adımları tekrarla (3 ürün oluştur)
3. Yeni **Live Price ID**'leri production `.env`'ye ekle

---

## 🔄 Kullanım Akışı

### 1. Kullanıcı Premium'a Geçiş Yapar

```
User → Premium Button → Payment Service
  ↓
Check if authenticated
  ↓
Backend: Detect location (IP-based)
  ↓
Select appropriate Price ID (TR/EU/Global)
  ↓
Create Stripe Checkout Session
  ↓
Redirect to Stripe payment page
```

### 2. Ödeme Sonrası

```
Stripe Payment Page → User pays
  ↓
Success → /payment/success?session_id=xxx
  ↓
Backend: Verify payment
  ↓
Supabase: Update user_licenses table
  ↓
Frontend: Show success message
  ↓
Redirect to Dashboard (3s)
```

---

## 🔍 Debugging

### Backend Logları

```bash
cd backend
node server.js
```

Test endpoint'leri:
```bash
# Health check
curl http://localhost:5000/api/health

# Location detection
curl http://localhost:5000/api/detect-location

# Create checkout (requires auth)
curl -X POST http://localhost:5000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"xxx","userEmail":"test@example.com"}'
```

### Stripe Dashboard

1. **Payments**: Tüm ödemeleri gör
2. **Customers**: Müşterileri gör
3. **Subscriptions**: Aktif abonelikleri gör
4. **Logs**: API request/response loglarını incele

### Supabase Database

```sql
-- Aktif premium kullanıcıları kontrol et
SELECT * FROM user_licenses 
WHERE is_active = true 
AND license_type = 'premium';

-- Süresi dolan lisanslar
SELECT * FROM user_licenses 
WHERE expires_at < NOW();
```

---

## ⚠️ Güvenlik Notları

1. **ASLA** `STRIPE_SECRET_KEY`'i frontend'de kullanma!
2. **ASLA** `.env` dosyasını git'e commit etme!
3. Webhook secret'ını doğrula (signature verification)
4. HTTPS kullan (production'da zorunlu)
5. Rate limiting ekle (DDoS koruması)

---

## 📚 Ek Kaynaklar

- [Stripe Official Docs](https://stripe.com/docs)
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [GeoIP Lite](https://github.com/bluesmoon/node-geoip)

---

## 🆘 Sorun Giderme

### "No such price" hatası
- Price ID'lerin doğru olduğundan emin ol
- Test/Live mod uyumluluğunu kontrol et (test modda test price IDs kullan)

### Webhook çalışmıyor
- Webhook secret doğru mu?
- Stripe CLI çalışıyor mu? (`stripe listen`)
- Endpoint erişilebilir mi?

### Location detection hatalı
- IP localhost ise default 'global' döner (normal)
- Production'da gerçek IP'ler test et

### Ödeme başarılı ama lisans aktif değil
- Webhook'un çalıştığından emin ol
- Supabase bağlantısını kontrol et
- `user_licenses` tablosu var mı?

---

**Son Güncelleme**: 6 Nisan 2026
**Versiyon**: 2.0 (Lokasyon Bazlı Fiyatlandırma)
