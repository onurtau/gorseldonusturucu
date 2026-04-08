# 🔐 Supabase Kurulum Rehberi

Bu belge, Görsel Dönüştürücü uygulamasına Supabase entegrasyonunu adım adım açıklar.

## 📋 Gereklilikler

- Node.js (v16+)
- npm veya yarn
- Supabase hesabı (ücretsiz)

## 🚀 Adım 1: Supabase Projesi Oluşturma

1. **Supabase'e giriş yapın**: https://app.supabase.com
2. **Yeni proje oluşturun**:
   - Organization seç veya oluştur
   - Project Name: `GorselDonusturucu`
   - Database Password: Güçlü bir şifre oluştur (kaydet!)
   - Region: `Europe (Frankfurt)` veya size en yakın bölge
   - **Create new project** butonu tıkla

3. **Proje hazır olana kadar bekle** (~2-3 dakika)

## 🔑 Adım 2: API Anahtarlarını Al

1. Sol menüden **Settings** (⚙️) → **API**
2. Şu bilgileri kopyala:
   - **Project URL**: `https://xxxxxxxxxxx.supabase.co`
   - **anon public** key

3. **`.env` dosyasını güncelle**:
```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Adım 3: Database Şemasını Oluşturma

1. Sol menüden **SQL Editor** → **New query**
2. Aşağıdaki SQL kodunu yapıştır ve **RUN** butonuna tıkla:

```sql
-- Genişletilmiş profil bilgileri tablosu
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lisans yönetimi tablosu
CREATE TABLE user_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  license_type TEXT CHECK (license_type IN ('free', 'premium', 'enterprise')),
  license_key TEXT UNIQUE,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kullanım istatistikleri tablosu
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: '2026-02'
  conversion_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0, -- bytes
  last_used TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Kullanıcı ayarları tablosu (senkronize)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Session yönetimi tablosu
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  platform TEXT,    -- 'Windows', 'Android', 'iOS', 'macOS', 'Linux'
  ip_address TEXT,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT false, -- Mevcut aktif cihaz mı?
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) Politikaları

-- user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_licenses RLS
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own licenses"
  ON user_licenses FOR SELECT
  USING (auth.uid() = user_id);

-- user_usage RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_settings RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- user_sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: Yeni kullanıcı kaydolduğunda otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Ücretsiz lisans oluştur
  INSERT INTO public.user_licenses (user_id, license_type)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Profil güncellendiğinde updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 🔒 Adım 4: Authentication Ayarları

1. Sol menüden **Authentication** → **Configuration** → **Email Auth**
2. **Ayarları yapılandır**:
   - ✅ Enable email confirmations (Email doğrulama zorunlu)
   - ✅ Enable email change confirmations
   - ✅ Secure email change
   - Minimum password length: `8`

3. **Site URL** ayarla:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

4. **Email Templates** → Customize
   - **Confirm signup** email şablonunu özelleştir (opsiyonel)

## 🌐 Adım 5: OAuth Providers (Google & Microsoft)

### Google OAuth

1. **Google Cloud Console**: https://console.cloud.google.com
2. Yeni proje oluştur: `GorselDonusturucu`
3. **APIs & Services** → **OAuth consent screen**:
   - User Type: `External`
   - App name: `Görsel Dönüştürücü`
   - Support email: Sizin emailiniz
   - Scopes: `email`, `profile`
4. **Credentials** → **Create Credentials** → **OAuth Client ID**:
   - Application type: `Web application`
   - Name: `Supabase Google Auth`
   - Authorized redirect URIs: Supabase'den kopyala (Authentication → Providers → Google → Callback URL)
5. **Client ID** ve **Client Secret** kopyala
6. **Supabase**:
   - Authentication → Providers → Google → Enable
   - Client ID ve Secret yapıştır → **Save**

### Microsoft OAuth

1. **Azure Portal**: https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**:
   - Name: `Görsel Dönüştürücü`
   - Supported account types: `Personal Microsoft accounts only`
   - Redirect URI: Supabase'den kopyala
3. **Certificates & secrets** → **New client secret**
4. **Application (client) ID** ve **Secret** kopyala
5. **Supabase**:
   - Authentication → Providers → Azure (Microsoft) → Enable
   - Client ID ve Secret yapıştır → **Save**

## 🛡️ Adım 6: Multi-Factor Authentication (2FA)

1. **Authentication** → **Configuration** → **Phone Auth**
2. **Authenticator App** → Enable TOTP

## ✅ Adım 7: Test Etme

1. Uygulamayı başlat:
```bash
npm start
```

2. Test senaryoları:
   - ✅ Kayıt ol (email doğrulama linkini kontrol et)
   - ✅ Email doğrula
   - ✅ Giriş yap
   - ✅ Google ile giriş
   - ✅ Microsoft ile giriş
   - ✅ Şifremi unuttum
   - ✅ Offline mod

## 🚨 Sorun Giderme

### Email gelmiyor
- Spam klasörünü kontrol edin
- Supabase → Authentication → Email Templates → Test email gönderin
- Email sunucusu ayarlarını kontrol edin (Authentication → Configuration → SMTP Settings)

### OAuth çalışmıyor
- Redirect URL'leri kontrol edin
- Google/Microsoft console'da client ID/secret doğru mu?
- `.env` dosyası güncel mi?

### Database hatası
- RLS politikaları doğru mu?
- Trigger çalıştı mı? (SQL Editor'de test edin)

## 📚 Ek Kaynaklar

- [Supabase Dökümanları](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 💰 Maliyet

**Ücretsiz Plan (Başlangıç)**:
- 500MB Database
- 1GB Storage
- 50,000 Monthly Active Users
- 2GB Bandwidth/ay
- **Ücretsiz** ✅

**Pro Plan (Büyüme)**:
- 8GB Database
- 100GB Storage
- 100,000 Monthly Active Users
- **$25/ay**

---

✅ Kurulum tamamlandı! Artık güvenli bir auth sisteminiz var.
