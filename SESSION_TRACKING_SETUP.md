# 🔧 Session Tracking Sistemi - Kurulum Rehberi

## 📋 Özet

Profil sayfasında "Aktif Cihazlar" bölümünde cihazların görünmesi için session tracking sistemi eklendi.

## ✅ Yapılan Değişiklikler

### 1. Yeni Dosyalar
- ✅ `src/utils/deviceInfo.js` - Cihaz bilgilerini tespit eden utility
- ✅ `supabase-session-tracking-update.sql` - Supabase SQL güncellemeleri

### 2. Güncellenen Dosyalar
- ✅ `src/store/useAuthStore.js` - Session tracking fonksiyonları eklendi
- ✅ `SUPABASE_SETUP.md` - user_sessions tablosu güncellendi

## 🚀 Kurulum Adımları

### Adım 1: Supabase SQL Güncellemesi (ÖNEMLİ!)

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın
4. `supabase-session-tracking-update.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

Alternatif olarak, komutları tek tek çalıştırabilirsiniz:

```sql
-- 1. INSERT politikası ekle
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. UPDATE politikası ekle
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. is_current sütunu ekle
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false;
```

### Adım 2: Uygulamayı Yeniden Başlatın

```bash
# Eğer çalışıyorsa uygulamayı durdurun (Ctrl+C)
# Sonra yeniden başlatın:
npm start
```

### Adım 3: Test Edin

1. Uygulamaya giriş yapın
2. Profil → Aktif Cihazlar sekmesine gidin
3. Mevcut cihazınızı görmelisiniz!

## 🎯 Özellikler

### ✨ Otomatik Session Tracking
- Kullanıcı giriş yaptığında otomatik olarak session kaydedilir
- Cihaz bilgileri (Windows PC, Chrome Browser, vb.) otomatik tespit edilir
- IP adresi kaydedilir (opsiyonel)

### 🔄 Periyodik Güncelleme
- Her 5 dakikada bir session aktivitesi güncellenir
- Son aktif zaman takip edilir

### 🗑️ Session Yönetimi
- Kullanıcı istediği cihazın session'ını sonlandırabilir
- Çıkış yapınca mevcut session otomatik silinir

### 📱 Cihaz Tanıma
- Desktop / Mobile / Tablet
- Windows / macOS / Linux / Android / iOS
- Browser bilgisi (Chrome, Firefox, Safari, Edge, vb.)

## 📊 Tespit Edilen Cihaz Bilgileri

Örnek çıktılar:
- "Chrome on Windows desktop"
- "Safari on iOS mobile"
- "Firefox on macOS desktop"
- "Windows Desktop App" (Electron)

## 🔍 Sorun Giderme

### Session'lar görünmüyor?

1. **Supabase SQL güncellemesi yapıldı mı?**
   - SQL Editor'de politikaları kontrol edin:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_sessions';
   ```
   - 4 politika görmelisiniz: SELECT, INSERT, UPDATE, DELETE

2. **Console'da hata var mı?**
   - F12 tuşuna basıp Console sekmesine bakın
   - "Session tracking error" araması yapın

3. **Tabloyu kontrol edin:**
   ```sql
   SELECT * FROM user_sessions;
   ```
   - En az bir kayıt görmelisiniz

### IP adresi "Unknown" gösteriliyor?

Bu normal! IP adresi alınamadığında "Unknown" yazılır. Session tracking yine de çalışır.

## 🎓 Teknik Detaylar

### Device Detection Algoritması

```javascript
// Cihaz tipi
if (tablet) return 'tablet'
else if (mobile) return 'mobile'
else return 'desktop'

// Platform
if (iOS) return 'iOS'
else if (Android) return 'Android'
else if (Windows) return 'Windows'
else if (macOS) return 'macOS'
else if (Linux) return 'Linux'
```

### Session Lifecycle

```
1. Login → trackSession() → INSERT user_sessions
2. Her 5 dk → updateSessionActivity() → UPDATE last_active
3. Logout → endSession() → DELETE user_sessions
```

## 📝 Notlar

- Session tracking başarısız olsa bile uygulama çalışmaya devam eder
- IP adresi alınamasa bile session kaydedilir
- Offline modda session takibi yapılmaz (normal davranış)

## 🎉 Başarı!

Artık profil sayfasında aktif cihazlarınızı görebilirsiniz!

---

**Son güncelleme:** 2 Nisan 2026
