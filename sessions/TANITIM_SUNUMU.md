# 🎨 Görsel Dönüştürücü - Profesyonel Tanıtım Sunumu

**Versiyon:** 1.0  
**Tarih:** Nisan 2026  
**Platform:** Desktop & Web

---

## 📋 İçindekiler

1. [Ürün Özeti](#ürün-özeti)
2. [Teknik Altyapı](#teknik-altyapı)
3. [Temel Özellikler](#temel-özellikler)
4. [Kullanıcı Faydaları](#kullanıcı-faydaları)
5. [Rakiplerden Farkımız](#rakiplerden-farkımız)
6. [Fiyatlandırma & İş Modeli](#fiyatlandırma--iş-modeli)

---

## 🎯 Ürün Özeti

### Ne Yapıyoruz?

**Görsel Dönüştürücü**, kullanıcıların görsel dosyalarını profesyonel kalitede dönüştürmesini, boyutlandırmasını ve özelleştirmesini sağlayan **hibrit platform** (masaüstü + web).

### Temel Misyon

Karmaşık görsel işleme araçlarını **herkes için erişilebilir, hızlı ve güvenli** hale getirmek.

### Hedef Kitle

- **Grafik Tasarımcılar** - Profesyonel renk uzayı dönüşümleri (CMYK↔RGB)
- **E-ticaret İşletmeleri** - Toplu ürün görseli optimize etme
- **Sosyal Medya Yöneticileri** - Hızlı format ve boyut dönüştürme
- **Fotoğrafçılar** - Filigran ekleme ve kalite korumalı boyutlandırma
- **Bireysel Kullanıcılar** - Basit, hızlı görsel işleme ihtiyaçları

---

## 🛠️ Teknik Altyapı

### Frontend Teknolojileri

| Teknoloji | Kullanım Amacı | Versiyon |
|-----------|----------------|----------|
| **React** | UI/UX Framework | 18.3+ |
| **Tailwind CSS** | Modern, responsive tasarım | 3.4+ |
| **Electron** | Masaüstü uygulama wrapper | 32+ |
| **Lucide React** | Modern icon seti | - |

### Backend & Altyapı

| Servis | Kullanım Amacı | Plan |
|--------|----------------|------|
| **Supabase** | Kullanıcı kimlik doğrulama, veritabanı | Pro ($25/ay) |
| **Stripe** | Ödeme işleme, abonelik yönetimi | 2.9% + $0.30/işlem |
| **Sharp** | Görsel işleme engine (Node.js) | - |
| **Hetzner VPS** | Backend API sunucusu (16GB RAM, 4 vCPU) | $44/ay |
| **Redis** | Cache & queue yönetimi | - |
| **Cloudflare CDN** | İçerik dağıtım, DDoS koruması | Ücretsiz |

**🆕 Stripe Entegrasyonu (Nisan 2026):**
- ✅ Location-based pricing (IP detection)
- ✅ 3 bölge, 3 currency (TRY/EUR/USD)
- ✅ Subscription lifecycle management
- ✅ Webhook support (automated renewals)
- ✅ Test & Live mode support
- ✅ PCI-DSS compliant (güvenli ödeme)

### İşleme Mimarisi

```
Desktop App (Electron):
  Dosya → Yerel İşleme (Sharp) → Kaydet
  ✓ Offline çalışır
  ✓ Verileriniz cihazınızda kalır
  ✓ Maksimum hız

Web App (Browser):
  Dosya → Backend API → İşleme (Sharp) → İndirme
  ✓ Platformdan bağımsız
  ✓ Kurulum gerektirmez
  ✓ Her yerden erişim
```

### Güvenlik & Gizlilik

- **Desktop:** Tüm işlemler **yerel cihazda** (dosyalar sunucuya yüklenmez)
- **Web:** İşlem sonrası **otomatik dosya silme** (geçici depolama)
- **Auth:** Supabase end-to-end şifreleme
- **Rate Limiting:** Spam ve kötüye kullanım koruması

---

## ✨ Temel Özellikler

### 1. Format Dönüştürme
**Desteklenen Formatlar:**
- **Ücretsiz:** JPG, PNG, WebP
- **Premium:** + TIFF, AVIF

**Kullanım Senaryoları:**
- Web için optimize edilmiş WebP dönüşümü (70% daha küçük dosya)
- Baskı için TIFF çıktısı
- Modern tarayıcılar için AVIF desteği

---

### 2. Boyutlandırma & Optimize Etme
**Özellikler:**
- Piksel veya yüzde ile boyutlandırma
- En-boy oranı koruma (otomatik)
- Kalite ayarı (1-100)
- Maksimum dosya boyutu hedefi

**Algoritma:**
- Lanczos3 resampling (profesyonel kalite)
- EXIF metadata koruması
- ICC color profile desteği

---

### 3. Filigran Ekleme
**Özellikler:**
- Metin veya görsel filigran
- 9 konum seçeneği (köşeler, kenarlar, merkez)
- Şeffaflık kontrolü (opacity)
- Boyut ayarı

**Kullanım Alanları:**
- Fotoğraf telif koruması
- Marka görünürlüğü
- Sosyal medya paylaşımları

---

### 4. Renk Uzayı Dönüşümü
**Profesyonel Özellik:**
- **RGB ↔ CMYK** (baskı hazırlığı)
- **sRGB ↔ AdobeRGB** (profesyonel fotoğrafçılık)
- ICC profile desteği
- Renk doğruluğu garantisi

**Hedef Kullanıcılar:**
- Matbaa hazırlıkları
- Profesyonel fotoğrafçılar
- Grafik tasarımcılar

---

### 5. Toplu İşlem (Batch Processing)
**Ücretsiz:** 10 dosyaya kadar  
**Premium:** 100+ dosya aynı anda

**Avantajlar:**
- Aynı ayarları çoklu dosyaya uygula
- Sürükle-bırak ile kolay yükleme
- İlerleme takibi (real-time)
- Hata yönetimi (başarısız dosyaları tekrar dene)

**Teknoloji:** Bull Queue sistemi (asenkron işleme, server çökmesi yok)

---

## 🎁 Kullanıcı Faydaları

### Bireysel Kullanıcılar
✅ **Ücretsiz Başlangıç** - Haftalık 10 dönüştürme, kredi kartı gerekmez  
✅ **Kullanım Kolaylığı** - Sürükle-bırak interface, 3 tıkla tamamla  
✅ **Hız** - Desktop'ta anında işleme (1-2 saniye)  
✅ **Gizlilik** - Dosyalarınız cihazınızda kalır

### Profesyonel Kullanıcılar
✅ **Sınırsız İşlem** - Premium ile kota yok  
✅ **Toplu İşlem** - 100+ dosya, zamandan tasarruf  
✅ **Profesyonel Kalite** - CMYK, ICC profile, kayıpsız dönüşüm  
✅ **Öncelikli Destek** - 24 saat içinde yanıt

### İşletmeler
✅ **E-ticaret Optimizasyonu** - Ürün görselleri toplu optimize  
✅ **Marka Koruma** - Otomatik filigran ekleme  
✅ **Platform Esnekliği** - Desktop veya web, tercihinize göre  
✅ **Maliyet Tasarrufu** - Photoshop/profesyonel araçlara alternatif

---

## 🏆 Rakiplerden Farkımız

### vs. iLovePDF / Canva / Online Dönüştürücüler

| Özellik | Görsel Dönüştürücü | iLovePDF | Canva | Online Araçlar |
|---------|-------------------|----------|-------|----------------|
| **Offline Çalışma** | ✅ Desktop | ❌ | ❌ | ❌ |
| **Veri Gizliliği** | ✅ Yerel işleme | ❌ Sunucuda | ❌ Sunucuda | ❌ Sunucuda |
| **Toplu İşlem** | ✅ 100+ dosya | ⚠️ 10-20 | ❌ Tek tek | ⚠️ Sınırlı |
| **CMYK Desteği** | ✅ Profesyonel | ❌ | ❌ | ❌ |
| **Filigran Özelleştirme** | ✅ 9 konum + opacity | ⚠️ Basit | ✅ Gelişmiş | ⚠️ Basit |
| **Ücretsiz Plan** | ✅ 10/hafta | ⚠️ 2-3 işlem | ⚠️ Sınırlı | ✅ Var ama reklam |
| **Hız (Desktop)** | ✅ 1-2 saniye | - | - | ⚠️ 5-10 saniye |
| **Platform** | ✅ Desktop + Web | 🌐 Sadece Web | 🌐 Sadece Web | 🌐 Sadece Web |

### vs. Photoshop / GIMP

| Özellik | Görsel Dönüştürücü | Photoshop | GIMP |
|---------|-------------------|-----------|------|
| **Öğrenme Eğrisi** | ✅ Kolay (3 dakika) | ❌ Zor (haftalar) | ❌ Orta (günler) |
| **Maliyet** | ✅ ₺49/ay | ❌ $600/yıl | ✅ Ücretsiz |
| **Toplu İşlem** | ✅ Yerleşik | ⚠️ Script gerekir | ⚠️ Karmaşık |
| **Dosya Boyutu** | ✅ Hafif (200MB) | ❌ Ağır (3GB+) | ❌ Orta (500MB) |
| **Kullanım Amacı** | Format dönüştürme | Tam fotoğraf editör | Tam fotoğraf editör |

### Benzersiz Değer Önerimiz

🎯 **"Photoshop kadar güçlü, Canva kadar basit, masaüstü kadar güvenli"**

**Temel Farklar:**

1. **Hibrit Platform** - Hem desktop hem web (rakipler sadece biri)
2. **Gizlilik Odaklı** - Desktop'ta dosyalar sunucuya GİTMEZ
3. **Profesyonel Kalite** - CMYK, ICC profile (hobist araçlarda yok)
4. **Queue Sistemi** - 100+ dosya server çökmeden işlenir (rakiplerde timeout)
5. **Türkçe Destek** - Arayüz TR/EN (global rakipler sadece İngilizce)

---

## 💰 Fiyatlandırma & İş Modeli

### 🆕 GÜNCEL: Lokasyon Bazlı Fiyatlandırma (Stripe Entegrasyonu - Nisan 2026)

**Yeni Strateji:** IP-based otomatik bölge tespiti ile satın alma gücü paritesi fiyatlandırması

| Bölge | Fiyat | Currency | Mantık |
|-------|-------|----------|--------|
| 🇹🇷 **Türkiye** | **₺119/ay** | TRY | Yerel pazar premium fiyat |
| 🇪🇺 **Avrupa** | **€3/ay** | EUR | 48 ülke, uluslararası rekabet |
| 🌍 **Global** | **$3/ay** | USD | Dünya geneli erişim |

**Not:** Türkiye'de ₺119 ≈ $2.67 (mevcut kur), yani Avrupa/Global'den DAHA UCUZ gerçek değerde!

**Teknik Altyapı:**
- ✅ Stripe Checkout entegre
- ✅ geoip-lite ile IP-based location detection
- ✅ 48 Avrupa ülkesi listesi (EU-27, EEA, UK, Balkans, vs.)
- ✅ Otomatik bölge tespiti (kullanıcı manuel seçim yok)
- ✅ Webhook support (subscription lifecycle management)
- ✅ Supabase license management

---

### Ücretsiz Plan
```
₺0 / Süresiz
────────────────
✓ Haftalık 10 dönüştürme
✓ Temel formatlar (JPG, PNG, WebP)
✓ Standart kalite
✓ Dosya başına 25MB limiti
✗ Filigran (watermark ile export)
✗ Toplu işlem (10+)
✗ CMYK desteği
✗ Öncelikli destek
```

### Premium Plan (Regional Pricing)
```
🇹🇷 ₺119/ay | 🇪🇺 €3/ay | 🌍 $3/ay
────────────────────────────────────
✓ SINIRSIZ dönüştürme
✓ TÜM formatlar (TIFF, AVIF)
✓ Profesyonel kalite
✓ Dosya başına SINIRSIZ boyut
✓ Filigran ekleme (watermark-free export)
✓ Toplu işlem (100+ dosya)
✓ CMYK ↔ RGB dönüşümü
✓ Öncelikli destek (24 saat)
✓ Reklamsız deneyim
```

### Gelir Modeli (Güncellenmiş - Nisan 2026)

**Freemium Stratejisi:**
1. **Ücretsiz kullanıcılar** → Ürünü test eder, alışır
2. **%5-10 conversion** → Premium'a geçer (sektör ortalaması)
3. **Lifetime value** → Ortalama 6-12 ay abonelik

**Regional Revenue Scenarios:**

**Türkiye Pazarı (₺119/ay):**
```
1,000 aktif kullanıcı
5% conversion = 50 premium
50 * ₺119 = ₺5,950/ay
Yıllık: ~₺71,400

10,000 aktif kullanıcı
7% conversion = 700 premium
700 * ₺119/ay = ₺83,300/ay
Yıllık: ~₺1,000,000
```

**Avrupa + Global Pazarı (€3 / $3 ortalama):**
```
5,000 aktif kullanıcı (EU+Global)
6% conversion = 300 premium
300 * $3 = $900/ay (₺27,000/ay)
Yıllık: ~₺324,000

20,000 aktif kullanıcı (scaled)
8% conversion = 1,600 premium
1,600 * $3 = $4,800/ay (₺144,000/ay)
Yıllık: ~₺1,728,000
```

**Kombine Senaryo (Yıl 1):**
```
TR: 10,000 kullanıcı (700 premium * ₺119) = ₺83,300/ay
EU+Global: 20,000 kullanıcı (1,600 premium * $3 ≈ ₺90) = ₺144,000/ay

Toplam MRR: ₺227,300/ay
Yıllık ARR: ~₺2,700,000
```

**Stratejik Avantajlar:**
- Türkiye'de premium positioning (₺119 yüksek ancak kaliteyi gösterir)
- Uluslararası pazarda agresif fiyat ($3/€3, iLovePDF'ye göre 80% ucuz)
- Volume play global pazarda (düşük fiyat → yüksek conversion)
- Purchasing power parity (her bölge kendi ekonomisine göre ödüyor)

**Ek Gelir Kaynakları (Gelecek):**
- **Kurumsal Plan** (₺199/ay, 5 kullanıcı, API erişimi)
- **API Servisi** (developer'lar için, işlem başı fiyatlandırma)
- **White-label** (kendi markanızla kullanma)

---

## 📊 Teknik Performans Metrikleri

### Hız Karşılaştırması

| İşlem | Desktop | Web | Rakip (Online) |
|-------|---------|-----|----------------|
| **Format Dönüştürme** (5MB JPG→PNG) | 1.2s | 3.5s | 8-12s |
| **Boyutlandırma** (10MB resim, 50%) | 0.8s | 2.1s | 6-10s |
| **Toplu İşlem** (50 dosya) | 40s | 90s | 300s+ (timeout riski) |
| **Filigran Ekleme** | 1.5s | 3.8s | 7-15s |

### Dosya Boyutu Optimizasyonu

**WebP Dönüşümü:**
- Orjinal JPG: 5MB
- WebP (kalite 90): 1.4MB
- **Tasarruf: %72**

**Toplu İşlem Verimliliği:**
- 100 dosya (500MB toplam)
- Desktop: ~2 dakika
- Web (queue system): ~4 dakika
- Rakipler: Timeout veya 15+ dakika

---

## 🚀 Piyasa Konumlandırması

### Hedef Segmentler

**1. Birincil Pazar (TR):**
- E-ticaret işletmeleri (200,000+ online mağaza)
- Freelance grafik tasarımcılar (~50,000)
- Sosyal medya ajansları (~15,000)

**2. İkincil Pazar (Global):**
- Small business owners
- Content creators
- Marketing teams

### Go-to-Market Stratejisi

**Faz 1 (İlk 3 Ay):**
- Desktop uygulaması Windows/Microsoft Store
- Google Ads (grafik dönüştürme, filigran ekleme)
- Influencer işbirlikleri (tasarım YouTube kanalları)

**Faz 2 (3-6 Ay):**
- Web versiyonu lansmanı
- SEO optimizasyonu (organik trafik)
- Freemium conversion optimizasyonu

**Faz 3 (6-12 Ay):**
- API servisi
- Kurumsal paket
- Uluslararası expanison

---

## 🎯 Başarı Metrikleri (KPI)

### Kullanıcı Metrikleri
- **Aktif Kullanıcı (MAU):** İlk yıl 10,000 hedef
- **Conversion Rate:** %5-7 (ücretsiz→premium)
- **Retention:** %60 (6 aylık)
- **Churn Rate:** <%10/ay

### Teknik Metrikleri
- **Uptime:** %99.9
- **API Response Time:** <500ms (p95)
- **Processing Speed:** <5s (ortalama dosya)
- **Error Rate:** <%0.1

### Finansal Metrikleri
- **MRR (Monthly Recurring Revenue):** İlk yıl ₺30,000
- **Customer Acquisition Cost (CAC):** ₺15-25
- **Lifetime Value (LTV):** ₺150-200
- **LTV/CAC Ratio:** >6

---

## 🔮 Gelecek Vizyonu (2026-2027)

### Yeni Özellikler (Q2-Q3 2026)
- ✨ **AI Arka Plan Kaldırma** (remove.bg entegrasyonu)
- 📐 **Akıllı Kırpma** (yüz tanıma ile otomatik)
- 🎨 **Renk Paletleri** (görselden palette extraction)
- 📱 **Mobil Uygulama** (React Native)

### Platform Genişletme
- 🖥️ **MacOS Build** (Electron)
- 🐧 **Linux Support**
- 🌐 **PWA (Progressive Web App)**
- 📱 **iOS/Android** (React Native)

### API & Entegrasyonlar
- 🔌 **REST API** (developer access)
- 🔗 **Shopify Plugin** (e-ticaret entegrasyonu)
- 🔗 **WordPress Integration**
- 🔗 **Zapier Automation**

---

## 📞 İletişim & Destek

**Website:** [Planlanan]  
**Email:** support@gorseldönusturucu.com  
**Platform:** Windows (aktif), Web (geliştirme aşamasında)

**Destek Kanalları:**
- Email destek (24 saat yanıt)
- Dokümantasyon (TR/EN)
- Video tutorials (YouTube)
- Community forum (planlanan)

---

## 📈 Özet: Neden Görsel Dönüştürücü?

### 3 Temel Güç

1. **🔒 Gizlilik & Güvenlik**
   - Desktop uygulaması: Dosyalarınız cihazınızda kalır
   - Sunucu yok = Veri sızıntısı riski yok
   - GDPR/KVKK uyumlu

2. **⚡ Hız & Performans**
   - Desktop'ta 1-2 saniye işlem
   - Queue sistemi ile 100+ dosya çökmeden
   - Web'de rakiplerden 2-3x daha hızlı

3. **💎 Profesyonel Kalite + Basitlik**
   - CMYK desteği (matbaa hazırlığı)
   - ICC color profile (fotoğrafçılık)
   - Kullanımı 3 dakikada öğrenilir

### Tek Cümlede

> **"Photoshop'un gücünü, Canva'nın basitliğiyle, masaüstü güvenliğinde birleştirdik."**

---

**© 2026 Görsel Dönüştürücü - Tüm hakları saklıdır.**  
**Versiyon:** 1.0 | **Son Güncelleme:** Nisan 2026
