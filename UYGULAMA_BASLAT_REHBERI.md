# 🚀 UYGULAMA BAŞLATMA REHBERİ

## ✅ Hazır! Artık 3 Yöntemle Başlatabilirsiniz:

### 🎯 YÖNTEM 1: Masaüstü Kısayolu (EN KOLAY)
1. Masaüstünüzde "Gorsel Donusturucu (Gelistirme).lnk" kısayolunu bulun
2. Çift tıklayın
3. 15 saniye bekleyin (React server başlıyor)
4. Electron penceresi otomatik açılacak ✅

**Avantaj:** Tek tıkla başlatma, basit!

---

### 🎯 YÖNTEM 2: Batch Dosyası
Proje klasöründe:
- `UYGULAMA-BASLAT.bat` dosyasına çift tıklayın
- Otomatik başlar

---

### 🎯 YÖNTEM 3: Manuel PowerShell (İleri Seviye)
```powershell
cd C:\Users\lenovo\GorselDonusturucu
npm run electron-dev
```

---

## ⚠️ DİKKAT: Önemli Notlar

### Neden 15 Saniye Bekliyor?
- React development server başlaması gerekiyor (port 3000)
- Electron ancak React hazır olduğunda çalışabilir  

### Siyah Ekran Sorunu
- Eski production build (.exe) çalışmıyor ❌
- Geliştirme modunu kullanın (yukarıdaki yöntemlerle) ✅

---

## 🛠️ Production Build'i Düzeltmek İster misiniz?

Eğer "normal" bir .exe dosyası olarak çalıştırmak isterseniz:
1. React build oluşturulacak
2. Electron production build yapılacak  
3. Tek .exe dosyası hazır olacak

**Yeni build oluşturmak için:**
```powershell
npm run electron-build
```

Bu işlem 5-10 dakika sürer ve sonunda `release/` klasöründe çalışan bir .exe oluşur.

---

## 💡 Hangisini Kullanmalıyım?

| Durum | Kullan |
|-------|--------|
| **Günlük kullanım** | Masaüstü kısayolu |
| **Geliştirme/test** | Batch dosyası veya masaüstü |
| **Başkalarına dağıt** | Production .exe (yeni build gerekli) |

---

## 🚀 Hemen Deneyin!

1. Masaüstünüze gidin
2. "Gorsel Donusturucu (Gelistirme)" kısayolunu bulun
3. Çift tıklayın
4. 15 saniye bekleyin
5. Uygulama açılacak! 🎉
