# Zylorpix Deployment Rehberi

## 📋 Hazırlık
- ✅ GitHub Repo: https://github.com/Onurtau/gorseldonusturucu.git
- ✅ Domain 1: www.zylorpix.com (Coming Soon)
- ✅ Domain 2: www.zylorpix.xyz (Beta Test)
- ✅ Coming Soon sayfası hazır
- ✅ robots.txt dosyaları hazır

---

## 🚀 ADIM 1: Vercel Hesabı Oluşturma

1. **Vercel'e Git**: https://vercel.com
2. **Sign Up** → "Continue with GitHub" seçin
3. GitHub hesabınızla giriş yapın
4. Vercel'in GitHub'a erişim izni isteğini onaylayın

---

## 🌐 ADIM 2: Coming Soon Sayfası Deploy (zylorpix.com)

### 2.1 Yeni Proje Oluştur
1. Vercel dashboard'da **"Add New..."** → **"Project"**
2. **"Import Git Repository"** altında `gorseldonusturucu` repo'sunu seçin
3. **"Import"** butonuna tıklayın

### 2.2 Proje Ayarları
- **Project Name**: `zylorpix-coming-soon`
- **Framework Preset**: `Other` (basit HTML)
- **Root Directory**: `coming-soon` klasörünü seçin (Edit ile)
- **Build Command**: Boş bırakın (HTML dosyası için build gerekmez)
- **Output Directory**: `.` (nokta)
- **Install Command**: Boş bırakın

### 2.3 Deploy
1. **"Deploy"** butonuna tıklayın
2. 1-2 dakika bekleyin
3. ✅ Deploy tamamlanınca Vercel size bir link verecek: `zylorpix-coming-soon.vercel.app`

### 2.4 Custom Domain Bağlama (zylorpix.com)
1. Vercel proje ayarlarında **"Settings"** → **"Domains"**
2. **"Add"** butonuna tıklayın
3. `www.zylorpix.com` yazın ve Enter
4. Vercel size DNS ayarları gösterecek (not alın):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 🧪 ADIM 3: Beta Uygulaması Deploy (zylorpix.xyz)

### 3.1 Yeni Proje Oluştur
1. Vercel dashboard'da tekrar **"Add New..."** → **"Project"**
2. Aynı `gorseldonusturucu` repo'sunu seçin
3. **"Import"** butonuna tıklayın

### 3.2 Proje Ayarları
- **Project Name**: `zylorpix-beta`
- **Framework Preset**: `Create React App`
- **Root Directory**: `/` (ana klasör, değiştirmeyin)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3.3 Environment Variables (ÖNEMLI!)
**"Environment Variables"** sekmesine tıklayın ve Supabase bilgilerinizi ekleyin:

```
REACT_APP_SUPABASE_URL = [Supabase URL'niz]
REACT_APP_SUPABASE_ANON_KEY = [Supabase Anon Key'iniz]
```

> ⚠️ **NOT**: Supabase bilgilerinizi src/supabaseClient.js dosyasından kopyalayabilirsiniz

### 3.4 Deploy
1. **"Deploy"** butonuna tıklayın
2. 3-5 dakika bekleyin (React build süreci)
3. ✅ Deploy tamamlanınca: `zylorpix-beta.vercel.app`

### 3.5 robots.txt Değiştirme (Beta için)
1. Vercel projesinde **"Settings"** → **"Environment Variables"**
2. Yeni değişken ekleyin:
   ```
   REACT_APP_ROBOTS = disallow
   ```
3. **"Redeploy"** butonuna tıklayın

> **NOT**: public/robots.txt dosyasını manuel olarak değiştirmeniz gerekebilir

### 3.6 Custom Domain Bağlama (zylorpix.xyz)
1. Vercel proje ayarlarında **"Settings"** → **"Domains"**
2. **"Add"** butonuna tıklayın
3. `www.zylorpix.xyz` yazın ve Enter
4. DNS ayarlarını not alın

---

## 🔧 ADIM 4: Natro DNS Ayarları

### 4.1 Natro'ya Giriş
1. https://www.natro.com → Giriş Yap
2. **"Domain Yönetimi"** veya **"DNS Yönetimi"**

### 4.2 zylorpix.com için DNS
1. `zylorpix.com` domain'ini seçin
2. **"DNS Yönetimi"** → **"DNS Kayıtları"**
3. Yeni CNAME kaydı ekleyin:
   - **Tip**: CNAME
   - **Host**: www
   - **Değer**: `cname.vercel-dns.com`
   - **TTL**: 3600 (veya Auto)
4. **Kaydet**

### 4.3 zylorpix.xyz için DNS
1. `zylorpix.xyz` domain'ini seçin
2. **"DNS Yönetimi"** → **"DNS Kayıtları"**
3. Yeni CNAME kaydı ekleyin:
   - **Tip**: CNAME
   - **Host**: www
   - **Değer**: `cname.vercel-dns.com`
   - **TTL**: 3600
4. **Kaydet**

> ⏱️ **DNS Yayılması**: 5 dakika - 48 saat arası sürebilir (genelde 10-30 dakika)

---

## ✅ ADIM 5: Doğrulama

### 5.1 DNS Kontrolü
Terminal'de DNS yayılmasını kontrol edin:
```powershell
nslookup www.zylorpix.com
nslookup www.zylorpix.xyz
```

### 5.2 Site Kontrolü
1. **www.zylorpix.com** → "Yakında Sizlerle" sayfası görünmeli
2. **www.zylorpix.xyz** → Tam uygulama açılmalı

### 5.3 SSL Sertifikası
- Vercel otomatik SSL sertifikası yükler
- `https://www.zylorpix.com` çalışmalı
- 🔒 simgesi tarayıcıda görünmeli

---

## 🎯 Beta Test İçin

### 5 Kişiye Vereceğiniz Link:
```
https://www.zylorpix.xyz
```

**Talimatlar**:
1. Kayıt ol
2. Giriş yap (Supabase Auth)
3. Görsel dönüştürme özelliklerini test et
4. Geri bildirim topla

---

## 🔄 Güncellemeler

### Coming Soon Sayfası Güncelleme:
```bash
cd C:\Users\lenovo\GorselDonusturucu\coming-soon
# Dosyaları düzenle
git add .
git commit -m "Coming soon güncellendi"
git push
```
→ Vercel otomatik deploy eder

### Beta Uygulaması Güncelleme:
```bash
cd C:\Users\lenovo\GorselDonusturucu
# Kodu düzenle
git add .
git commit -m "Güncelleme"
git push
```
→ Vercel otomatik deploy eder

---

## 🚀 Production'a Geçiş (Hazır olunca)

1. **zylorpix.com** projesini sil veya domain'i değiştir
2. Yeni deployment oluştur:
   - Tam React uygulaması
   - `www.zylorpix.com` domain'ini bağla
3. **zylorpix.xyz** projesini kapat veya arşivle

---

## 📞 Sorun Giderme

### DNS çalışmıyor:
- 24 saat bekleyin
- Natro DNS cache'ini temizleyin
- `ipconfig /flushdns` (Windows)

### Vercel deployment hatası:
- Environment variables kontrolü
- Build log'larını inceleyin
- `npm run build` local'de test edin

### Supabase bağlantı hatası:
- Environment variables doğru mu?
- Supabase public/anon key mi kullanıyorsunuz?

---

## ✨ Tamamdır!

Her iki site de hazır:
- 🌐 **www.zylorpix.com** → Coming Soon (Herkese açık)
- 🧪 **www.zylorpix.xyz** → Beta Test (5 kişi)

**Başarılar! 🎉**
