import React, { createContext, useContext, useState, useEffect } from 'react';

// Çeviri dosyaları
const translations = {
  tr: {
    // Errors
    errors: {
      electronApiNotFound: 'Electron API bulunamadı.'
    },

    // Header
    header: {
      title: 'Görsel Dönüştürücü',
      subtitle: 'Profesyonel Görüntü İşleme',
      usageCount: 'Kullanım Kullanılabilir',
      unlimited: 'Sınırsız',
      upgradeToPremium: 'Premium\'a Geç',
      profile: 'Profil',
      settings: 'Ayarlar',
      logout: 'Çıkış Yap',
      home: 'Ana Sayfa',
      premium: 'Premium',
      freeUsage: 'Ücretsiz Kullanım',
      user: 'Kullanıcı',
      freeUsageLimitReached: 'Ücretsiz dönüştürme hakkınız doldu. Devam etmek için premium lisans alın.',
      login: 'Giriş Yap',
      downloadDesktop: 'Desktop İndir',
      download: 'İndir'
    },

    // Auth Pages
    auth: {
      // Login Page
      login: {
        welcome: 'Hoş Geldiniz',
        subtitle: 'Görsel Dönüştürücü\'ye giriş yapın',
        email: 'E-posta',
        emailPlaceholder: 'ornek@email.com',
        password: 'Şifre',
        passwordPlaceholder: '••••••••',
        forgotPassword: 'Şifremi Unuttum',
        rememberMe: 'Beni Hatırla',
        loginButton: 'Giriş Yap',
        loggingIn: 'Giriş Yapılıyor...',
        googleLogin: 'Google ile Giriş Yap',
        microsoftLogin: 'Microsoft ile Giriş Yap',
        orContinueWith: 'veya',
        noAccount: 'Hesabınız yok mu?',
        registerLink: 'Kayıt Ol',
        emailError: 'Geçerli bir email adresi girin',
        passwordError: 'Şifre en az 8 karakter olmalıdır'
      },
      
      // Register Page
      register: {
        createAccount: 'Hesap Oluşturun',
        subtitle: 'Görsel Dönüştürücü\'ye katılın',
        fullName: 'Ad Soyad',
        fullNamePlaceholder: 'Ahmet Yılmaz',
        email: 'E-posta',
        emailPlaceholder: 'ornek@email.com',
        password: 'Şifre',
        passwordPlaceholder: '••••••••',
        confirmPassword: 'Şifre Tekrarı',
        confirmPasswordPlaceholder: '••••••••',
        passwordStrength: 'Şifre Gücü:',
        weak: 'Zayıf',
        medium: 'Orta',
        strong: 'Güçlü',
        terms: 'Kayıt olarak',
        termsLink: 'Kullanım Koşulları',
        and: 've',
        privacyLink: 'Gizlilik Politikası',
        termsAgree: '\'nı kabul etmiş olursunuz.',
        registerButton: 'Kayıt Ol',
        registering: 'Hesap Oluşturuluyor...',
        googleSignup: 'Google ile Kayıt Ol',
        microsoftSignup: 'Microsoft ile Kayıt Ol',
        orContinueWith: 'veya',
        alreadyHaveAccount: 'Zaten hesabınız var mı?',
        loginLink: 'Giriş Yap',
        fullNameError: 'Ad Soyad en az 2 karakter olmalıdır',
        emailError: 'Geçerli bir email adresi girin',
        passwordMinError: 'Şifre en az 8 karakter olmalıdır',
        passwordUpperError: 'En az bir büyük harf içermelidir',
        passwordLowerError: 'En az bir küçük harf içermelidir',
        passwordNumberError: 'En az bir rakam içermelidir',
        passwordMatchError: 'Şifreler eşleşmiyor',
        registrationSuccess: 'Kayıt Başarılı!',
        emailVerificationSent: 'E-posta adresinize doğrulama linki gönderdik. Lütfen email kutunuzu kontrol edin.',
        emailNotReceived: 'Email gelmedi mi? Spam/gereksiz klasörünü kontrol edin.',
        backToLogin: 'Giriş Sayfasına Dön'
      },
      
      // Forgot Password Page
      forgotPassword: {
        title: 'Şifremi Unuttum',
        subtitle: 'Email adresinize şifre sıfırlama linki göndereceğiz',
        email: 'E-posta',
        emailPlaceholder: 'ornek@email.com',
        sendButton: 'Şifre Sıfırlama Linki Gönder',
        sending: 'Gönderiliyor...',
        backToLogin: 'Giriş Sayfasına Dön',
        emailError: 'Geçerli bir email adresi girin',
        emailSentTitle: 'Email Gönderildi! ✉️',
        emailSentTo: 'adresine',
        emailSentMessage: 'şifre sıfırlama linki gönderdik. Lütfen email kutunuzu kontrol edin.',
        emailNotReceived: 'Email gelmedi mi? Spam/gereksiz klasörünü kontrol edin veya birkaç dakika bekleyin.'
      },

      // Footer
      footer: {
        copyright: '© 2026 Görsel Dönüştürücü. Tüm hakları saklıdır.'
      }
    },

    // Landing Page
    landing: {
      // Hero Section
      hero: {
        badge: '🎨 Profesyonel Görsel İşleme Aracı',
        title: 'Görsellerinizi Dönüştürün',
        titleHighlight: 'Profesyonel Kalitede',
        subtitle: 'Format dönüştürme, boyut küçültme, renk uzayı dönüşümü ve filigran ekleme. Hepsi tek bir yerde, hızlı ve kolay.',
        feature1: '✓ Birden fazla format desteği',
        feature2: '✓ Toplu işlem',
        feature3: '✓ Profesyonel kalite',
        ctaFree: 'Ücretsiz Başlayın',
        ctaLogin: 'Giriş Yap',
        trustBadge: 'Kredi kartı gerektirmez • Haftalık 10 ücretsiz dönüştürme'
      },

      // Footer Links
      footer: {
        features: 'Özellikler',
        pricing: 'Fiyatlandırma',
        faq: 'Sık Sorulan Sorular',
        about: 'Hakkımızda',
        contact: 'İletişim',
        blog: 'Blog',
        privacy: 'Gizlilik Politikası',
        terms: 'Kullanım Şartları',
        description: 'Profesyonel görsel dönüştürme ve optimizasyon aracı. Web, mobil ve masaüstü uygulamaları için hızlı ve güvenilir çözüm.',
        productTitle: 'Ürün',
        companyTitle: 'Şirket',
        legalTitle: 'Yasal'
      },

      // Premium Section
      premium: {
        sectionBadge: 'Premium Avantajları',
        title: 'Daha Fazlasını Yapın',
        subtitle: 'Sınırsız işlem hakkı ve premium destek ile verimliliğinizi artırın',
        freePlan: 'Ücretsiz',
        freePrice: '₺0',
        premiumPlan: 'Premium',
        premiumPrice: '₺119',
        perMonth: '/ay',
        popular: 'EN POPÜLER',
        
        // Free Plan Features
        weeklyLimit: 'Haftada 10 işlem hakkı',
        allFormats: 'Tüm formatlar (JPG, PNG, WebP, AVIF, TIFF)',
        formatConversion: 'Format dönüştürme',
        resizeCompress: 'Boyut küçültme ve optimize',
        cmykConversion: 'CMYK ↔ RGB dönüşümü',
        watermarkAdd: 'Filigran ekleme',
        batchProcessing: 'Toplu işlem',
        qualitySettings: 'Kalite ayarları',
        
        // Premium Plan Features
        unlimitedOperations: 'SINIRSIZ işlem',
        allFeatures: 'Tüm özellikler',
        prioritySupport: 'Öncelikli destek',
        adFree: 'Reklamsız deneyim',
        cloudStorage: 'Cloud depolama',
        
        upgradeButton: 'Premium\'a Geç',
        currentPlan: 'Mevcut Plan',
        loading: 'Yükleniyor...',
        checkoutError: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.',
        bottomNote: 'İstediğiniz zaman iptal edebilirsiniz • Güvenli ödeme'
      },

      // Features Section
      features: {
        badge: 'Güçlü Özellikler',
        title: 'Her İhtiyacınız İçin Araçlar',
        subtitle: 'Profesyonel görsel işleme için ihtiyacınız olan her şey',
        feature1Title: 'Hızlı İşleme',
        feature1Desc: 'Anında dönüştürme ve optimize edilmiş performans',
        feature2Title: 'Toplu İşlem',
        feature2Desc: 'Yüzlerce dosyayı aynı anda işleyin',
        feature3Title: 'Güvenli ve Özel',
        feature3Desc: 'Dosyalarınız sadece cihazınızda kalır',
        feature4Title: 'Bulut Depolama',
        feature4Desc: 'İşlenmiş dosyaları bulutta saklayın',
        feature5Title: 'Profesyonel Kalite',
        feature5Desc: 'Kayıpsız dönüşüm ve optimizasyon',
        feature6Title: 'Veri Koruması',
        feature6Desc: 'EXIF ve meta verilerini koruma',
        feature7Title: 'Otomatik Güncelleme',
        feature7Desc: 'Her zaman en son özellikler',
        feature8Title: 'Offline Çalışma',
        feature8Desc: 'İnternet bağlantısı gerektirmez'
      },

      // How It Works Section
      howItWorks: {
        badge: 'Nasıl Çalışır',
        title: '3 Adımda Tamamlayın',
        subtitle: 'Görsel işleme hiç bu kadar kolay olmamıştı',
        step1Title: 'Dosyaları Yükleyin',
        step1Desc: 'Sürükle-bırak ile veya dosya seçerek görsellerinizi ekleyin. Toplu yükleme desteklenir.',
        step2Title: 'Ayarları Yapın',
        step2Desc: 'Format, kalite, boyut ve diğer seçenekleri ihtiyacınıza göre ayarlayın.',
        step3Title: 'İndirin',
        step3Desc: 'İşlenmiş dosyalarınızı anında indirin veya bulutta saklayın.',
        bottomText: 'Dakikalar içinde profesyonel sonuçlar'
      },

      // Stats Section
      stats: {
        badge: 'İstatistikler',
        title: 'Rakamlarla Başarımız',
        subtitle: 'Binlerce kullanıcının güvendiği platform',
        stat1Value: '10,000+',
        stat1Label: 'Aktif Kullanıcı',
        stat2Value: '1M+',
        stat2Label: 'İşlenmiş Görsel',
        stat3Value: '99.9%',
        stat3Label: 'Başarı Oranı',
        stat4Value: '4.9/5',
        stat4Label: 'Kullanıcı Puanı'
      },

      // FAQ Section
      faq: {
        badge: 'Sıkça Sorulan Sorular',
        title: 'Merak Edilenler',
        subtitle: 'En çok sorulan soruların yanıtları',
        q1: 'Ücretsiz plan ile ne kadar dönüştürme yapabilirim?',
        a1: 'Ücretsiz planla haftalık 10 dönüştürme hakkınız bulunmaktadır. Premium plana geçerek sınırsız dönüştürme yapabilirsiniz.',
        q2: 'Dosyalarım güvenli mi?',
        a2: 'Evet, tüm işlemler cihazınızda gerçekleşir. Dosyalarınız sunucularımıza yüklenmez ve sadece sizin cihazınızda kalır.',
        q3: 'Hangi formatları destekliyorsunuz?',
        a3: 'JPG, PNG, WebP formatları ücretsiz planda desteklenmektedir. Premium planda TIFF ve AVIF formatları da kullanılabilir.',
        q4: 'Toplu işlem nasıl çalışır?',
        a4: 'Birden fazla dosyayı seçerek aynı anda işleyebilirsiniz. Premium kullanıcılar 100+ dosyayı aynı anda işleyebilir.',
        q5: 'Premium planı iptal edebilir miyim?',
        a5: 'Evet, premium planınızı istediğiniz zaman iptal edebilirsiniz. İptal ettikten sonra mevcut dönem sonuna kadar premium özelliklerden yararlanmaya devam edersiniz.',
        q6: 'Offline çalışır mı?',
        a6: 'Evet, masaüstü uygulamamız tamamen offline çalışır. İnternet bağlantısına ihtiyaç duymadan tüm işlemleri yapabilirsiniz.',
        bottomText: 'Sorunuz mu var?',
        contactLink: 'Bize ulaşın'
      },

      // CTA Section
      cta: {
        badge: 'Hemen Başlayın',
        title: 'Profesyonel Görsel İşlemeye Başlayın',
        subtitle: 'Ücretsiz hesap oluşturun ve haftalık 10 dönüştürme hakkından yararlanın',
        benefit1: '✓ Kredi kartı gerektirmez',
        benefit2: '✓ Anında başlayın',
        benefit3: '✓ İstediğiniz zaman iptal',
        benefit4: '✓ 7/24 destek',
        button: 'Ücretsiz Başlayın',
        trustBadge: 'Binlerce kullanıcının tercihi • Güvenli ve hızlı'
      },

      // Tools Section
      tools: {
        title: 'Görsellerinizi düzenlemek için istediğiniz aracı seçin',
        subtitle: 'Online editör ile tasarımlarınızı hızlı ve kaliteli olarak dönüştürün',
        startNow: 'Başlat →',
        trialInfo: 'Ücretsiz deneme: Haftada 10 işlem hakkı',
        formatConversion: {
          title: 'Format Dönüştürme',
          description: 'JPG, PNG, WebP, AVIF, TIFF formatları arasında dönüştürün',
          feature1: 'JPG ↔ PNG',
          feature2: 'WebP Desteği',
          feature3: 'AVIF/TIFF'
        },
        resize: {
          title: 'Boyut Küçültme',
          description: 'Hedef boyut (KB) belirleyerek optimize edin',
          feature1: 'Hedef Boyut (KB)',
          feature2: 'Otomatik Kalite',
          feature3: 'Optimize'
        },
        colorspace: {
          title: 'Renk Uzayı',
          description: 'RGB ve CMYK dönüşümü',
          feature1: 'RGB (Ekran)',
          feature2: 'CMYK (Baskı)',
          feature3: 'ICC Profil'
        },
        watermark: {
          title: 'Filigran Ekleme',
          description: 'Gölge ve döşeme destekli filigran',
          feature1: 'Metin Filigran',
          feature2: 'Gölge Efekti',
          feature3: 'Döşeme Deseni'
        },
        allInOne: {
          title: 'Tümü Bir Arada',
          description: 'Tüm özellikleri tek seferde kullanın',
          feature1: 'Format + Boyut',
          feature2: 'Renk + Filigran',
          feature3: 'Toplu İşlem'
        }
      }
    },

    // HomePage
    home: {
      title: 'Görsel Dönüştürücü',
      subtitle: 'Profesyonel görsel işleme araçlarıyla çalışmalarınızı hızlandırın',
      selectOperation: 'Bir işlem seçin',
      features: {
        formatConversion: {
          title: 'Format Dönüştürme',
          description: 'Görsellerinizi farklı formatlara dönüştürün'
        },
        resize: {
          title: 'Boyut Küçültme',
          description: 'Dosya boyutunu ve kaliteyi optimize edin'
        },
        colorspace: {
          title: 'Renk Uzayı Dönüşümü',
          description: 'RGB ve CMYK arasında dönüşüm yapın'
        },
        watermark: {
          title: 'Filigran Ekleme',
          description: 'Görsellerinize özel filigran ekleyin'
        },
        multi: {
          title: 'Tümü Bir Arada',
          description: 'Tüm özellikleri birlikte kullanın'
        }
      },
      tips: {
        title: 'İpucu',
        single: 'Tek bir işlem yapmak istiyorsanız, ilgili kartı seçin',
        multiple: 'Birden fazla işlemi aynı anda yapmak için "Tümü Bir Arada" seçeneğini kullanın',
        batch: 'Tüm işlemler toplu dosya desteği sunar'
      },
      popular: 'Popüler'
    },

    // FormatConversion
    formatConversion: {
      title: 'Format Dönüştürme',
      subtitle: 'Görsellerinizi farklı formatlara dönüştürün',
      selectFormat: 'Çıkış Formatı',
      selectedFormat: 'Seçilen format',
      convert: 'Dönüştür',
      converting: 'İşleniyor...',
      formats: {
        jpg: { name: 'JPG', description: 'En yaygın format, küçük boyut' },
        png: { name: 'PNG', description: 'Şeffaflık destekli, kaliteli' },
        webp: { name: 'WEBP', description: 'Modern, optimize boyut' },
        avif: { name: 'AVIF', description: 'Yeni nesil, mükemmel sıkıştırma' },
        tiff: { name: 'TIFF', description: 'Profesyonel, kayıpsız' },
        bmp: { name: 'BMP', description: 'Basit bitmap format' },
        gif: { name: 'GIF', description: 'Animasyon destekli' }
      }
    },

    // Resize
    resize: {
      title: 'Boyut Küçültme',
      subtitle: 'Dosya boyutunu ve kaliteyi optimize edin',
      optimizationSettings: 'Optimizasyon Ayarları',
      quality: 'Kalite',
      lowQuality: 'Düşük Kalite (Küçük Boyut)',
      highQuality: 'Yüksek Kalite (Büyük Boyut)',
      targetSize: 'Hedef Dosya Boyutu (Opsiyonel)',
      example: 'Örn: 500',
      targetSizeHint: 'Belirli bir boyutun altına düşürmek için hedef değer girin',
      howItWorks: 'Nasıl Çalışır?',
      howItWorksItem1: 'Kalite düşürülerek dosya boyutu küçültülür',
      howItWorksItem2: 'Hedef boyut girilirse, o boyuta ulaşana kadar kalite ayarlanır',
      howItWorksItem3: 'Orijinal format korunur (JPG → JPG, PNG → PNG)',
      optimizeButton: 'Optimize Et',
      optimized: 'optimize edildi',
      reduced: 'küçültüldü',
      filesOptimized: 'dosya optimize edildi',
      pngTargetSizeWarningTitle: 'PNG + Hedef Boyut Uyarısı',
      pngTargetSizeWarning: 'PNG kayıpsız bir formattır ve hedef dosya boyutu özelliği ile uyumlu değildir. Dosya boyutu hedeflenen değere düşmeyebilir, hatta artabilir. Boyut küçültme için format dönüştürme sayfasında JPEG, WebP veya AVIF formatlarını kullanın.'
    },

    // ColorSpace
    colorSpace: {
      title: 'Renk Uzayı Dönüşümü',
      subtitle: 'RGB ve CMYK arasında dönüşüm yapın',
      targetColorSpace: 'Hedef Renk Uzayı',
      selectColorSpace: 'Renk Uzayı',
      rgbItem1: 'Dijital görseller için ideal',
      rgbItem2: 'Ekran görüntüleme',
      rgbItem3: 'Web ve sosyal medya',
      cmykItem1: 'Baskı işleri için',
      cmykItem2: 'Profesyonel matbaa',
      cmykItem3: 'Katalog, broşür, afiş',
      conversionInfo: 'Dönüşüm Bilgisi',
      conversionInfoText: 'Seçtiğiniz renk uzayına dönüştürme yapılır. RGB dijital için, CMYK baskı için kullanılır. Renk profilleri otomatik olarak ayarlanır.',
      convert: 'Dönüştür',
      converting: 'İşleniyor...',
      converted: 'dönüştürüldü',
      filesConverted: 'dosya dönüştürüldü',
      cmykWarning: {
        title: 'CMYK Format Uyarısı',
        message: 'Seçili dosyalarınız ({formats}) CMYK renk uzayını desteklemiyor. CMYK dönüşümü için dosyalarınızı önce TIFF veya JPEG formatına dönüştürmeniz gerekiyor.',
        action: 'Format Dönüşüm\'e Git'
      },
      options: {
        rgb: { name: 'RGB', description: 'Dijital ekranlar için ideal' },
        cmyk: { name: 'CMYK', description: 'Baskı işleri için profesyonel' }
      }
    },

    // Watermark
    watermark: {
      title: 'Filigran Ekleme',
      subtitle: 'Görsellerinize özel filigran ekleyin',
      settings: 'Filigran Ayarları',
      text: 'Filigran Metni',
      textPlaceholder: 'Örn: © 2026 Adınız',
      placeholder: 'Metninizi girin',
      position: 'Pozisyon',
      topLeft: 'Sol Üst',
      topRight: 'Sağ Üst',
      bottomLeft: 'Sol Alt',
      bottomRight: 'Sağ Alt',
      center: 'Orta',
      opacity: 'Şeffaflık',
      fontSize: 'Yazı Boyutu',
      fontFamily: 'Yazı Tipi',
      autoScale: 'Görsel genişliğine göre otomatik ölçeklenir',
      color: 'Yazı Rengi',
      gray: 'Gri',
      white: 'Beyaz',
      black: 'Siyah',
      red: 'Kırmızı',
      shadow: 'Gölgelendirme',
      shadowDesc: 'Metni daha görünür yapar',
      tileMode: 'Döşeme Modu',
      tileModeDesc: 'Tüm ekrana tekrarlı filigran',
      preview: 'Önizleme',
      positions: {
        topLeft: 'Sol Üst',
        topRight: 'Sağ Üst',
        center: 'Merkez',
        bottomLeft: 'Sol Alt',
        bottomRight: 'Sağ Alt'
      },
      apply: 'Filigran Ekle',
      applying: 'İşleniyor...',
      addButton: 'Filigran Ekle',
      textMissing: 'Filigran Metni Eksik',
      pleaseEnterText: 'Lütfen filigran metni girin',
      added: 'filigran eklendi',
      filesProcessed: 'dosyaya filigran eklendi'
    },

    // WatermarkPreview
    watermarkPreview: {
      livePreview: 'Canlı Önizleme',
      watermarkActive: 'Filigran Aktif',
      preview: 'Önizleme',
      enterWatermarkText: '✏️ Filigran metninizi sağ tarafta girin',
      imageSize: '📐 Görsel Boyutu:',
      watermarkFont: '✏️ Filigran Font:',
      liveUpdateTip: '💡 Ayarları değiştirdiğinizde önizleme anında güncellenir'
    },

    // Multi
    multi: {
      title: 'Tümü Bir Arada',
      subtitle: 'Tüm özellikleri birlikte kullanın',
      process: 'İşle',
      processing: 'İşleniyor...'
    },

    // Stats Panel
    stats: {
      title: 'İstatistikler',
      totalConversions: 'Toplam Dönüşüm',
      sizeSaved: 'Tasarruf Edilen',
      avgCompression: 'Ort. Sıkıştırma',
      noConversions: 'Henüz dönüşüm yapılmadı'
    },

    // Conversion Panel
    conversionPanel: {
      title: '⚙️ Dönüşüm Ayarları',
      outputFormat: 'Çıktı Formatı',
      quality: 'Kalite',
      targetFileSize: 'Hedef Dosya Boyutu (KB) - Opsiyonel',
      targetFileSizeHint: 'Boş bırakırsanız sadece kalite ayarı kullanılır',
      watermarkTitle: '🎨 Watermark (Filigran)',
      watermarkText: 'Watermark Metni',
      watermarkPlaceholder: 'Örn: © 2026 Adınız',
      opacity: 'Şeffaflık',
      fontSize: 'Yazı Boyutu',
      fontSizePlaceholder: 'Örn: 500',
      fontFamily: 'Yazı Tipi',
      textColor: 'Yazı Rengi',
      position: 'Pozisyon',
      shadow: 'Gölgelendirme',
      shadowHint: 'Görselliği artırır',
      convert: 'Dönüştür',
      bulkConvert: '🚀 Toplu Dönüştür ({count})',
      processing: 'İşleniyor...',
      cmykInfo: 'CMYK → RGB dönüşümü profesyonel ICC profil ile yapılır',
      exampleOutput: 'Örnek çıktı:',
      formats: {
        jpeg: 'JPEG (.jpg)',
        png: 'PNG (.png)',
        webp: 'WebP (.webp)',
        avif: 'AVIF (.avif) 🔥 Yeni Nesil',
        tiff: 'TIFF (.tiff)',
        bmp: 'BMP (.bmp)'
      },
      positions: {
        topLeft: 'Sol Üst',
        topRight: 'Sağ Üst',
        bottomLeft: 'Sol Alt',
        bottomRight: 'Sağ Alt',
        center: 'Orta'
      },
      colors: {
        gray: 'Gri',
        white: 'Beyaz',
        black: 'Siyah',
        red: 'Kırmızı'
      },
      colorSpaceOptions: {
        dontConvert: 'Dönüştürme (Orijinal)',
        toRgb: 'RGB\'ye Dönüştür (Profesyonel)',
        toCmyk: 'CMYK\'ye Dönüştür (Temel)'
      },
      preserveMetadata: 'Meta Verileri Koru',
      metadataInfo: 'EXIF ve renk profili bilgileri',
      addWatermark: 'Filigran Ekle',
      addWatermarkDesc: 'Görsele metin filigranı ekle',
      fontSizeSmall: 'Küçük (%2)',
      fontSizeMedium: 'Orta (%5)',
      fontSizeLarge: 'Büyük (%15)',
      autoScaleHint: 'Görsel genişliğine göre otomatik ölçeklenir',
      grayColorTip: 'İpucu: Gri renk hem koyu hem açık görsellerde görünür',
      shadowTip: 'Gölgelendirme metni daha görünür yapar ancak rengi değiştirmez',
      tileMode: 'Döşeme Modu',
      tileModeDesc: 'Tüm ekrana tekrarlı filigran',
      pngTargetSizeWarningTitle: 'PNG + Hedef Boyut Uyarısı',
      pngTargetSizeWarning: 'PNG kayıpsız bir formattır ve hedef dosya boyutu özelliği ile uyumlu değildir. Dosya boyutu hedeflenen değere düşmeyebilir, hatta artabilir. Boyut küçültme için lütfen JPEG, WebP veya AVIF formatlarını tercih edin.',
      notifications: {
        error: 'Hata',
        electronNotFound: 'Electron API bulunamadı',
        limitReached: 'Limit Doldu',
        limitMessage: 'Ücretsiz limit doldu. Premium hesaba geçin.',
        noFilesSelected: 'Dosya Seçilmedi',
        noFilesMessage: 'Lütfen en az bir dosya seçin',
        noFormatSelected: 'Format Seçilmedi',
        noFormatMessage: 'Lütfen bir çıktı formatı seçin',
        conversionSuccess: 'Dönüştürme Başarılı',
        successMessage: 'dosya başarıyla dönüştürüldü',
        bulkConversionComplete: 'Toplu Dönüştürme Tamamlandı',
        bulkSuccessMessage: 'dosya başarıyla dönüştürüldü',
        paused: 'Duraklatıldı',
        pausedMessage: 'İşlem duraklatıldı. Devam edebilirsiniz.',
        cancelled: 'İptal Edildi',
        cancelledMessage: 'ü işlendi'
      }
    },

    // FileUploadZone
    fileUpload: {
      dragDrop: 'Dosyaları sürükleyin veya tıklayın',
      supportedFormats: 'Desteklenen formatlar',
      maxSize: 'Maksimum dosya boyutu',
      selectFiles: 'Dosya Seç',
      tipTitle: 'İpucu:',
      tipText: 'Birden fazla dosyayı aynı anda seçebilir veya toplu işlem yapabilirsiniz.',
      invalidFile: 'Geçersiz Dosya',
      selectValidFiles: 'Lütfen geçerli görsel dosyaları seçin.',
      someFilesSkipped: 'Bazı Dosyalar Atlandı',
      invalidFilesSkipped: '{count} geçersiz dosya atlandı.',
      filesAdded: 'Dosyalar Eklendi',
      filesAddedSuccess: '{count} dosya başarıyla eklendi.',
      fileSelectError: 'Dosya seçilirken bir hata oluştu.'
    },

    // FileList
    fileList: {
      title: 'Dosya Listesi',
      showing: 'gösteriliyor',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Tümünü Kaldır',
      selected: 'seçili',
      clearAll: 'Tümünü Temizle',
      saved: 'tasarruf',
      reduced: 'küçültüldü',
      increased: 'büyüdü',
      loadMore: 'Daha Fazla Göster',
      moreFiles: 'dosya daha',
      remaining: 'Kalan',
      files: 'dosya'
    },

    // FileList
    fileList: {
      title: 'Dosya Listesi',
      showing: 'gösteriliyor',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Tümünü Kaldır',
      selected: 'seçili',
      clearAll: 'Tümünü Temizle',
      saved: 'tasarruf',
      reduced: 'küçültüldü',
      increased: 'büyüdü',
      loadMore: 'Daha Fazla Göster',
      moreFiles: 'dosya daha',
      remaining: 'Kalan',
      files: 'dosya'
    },

    // Settings
    settings: {
      title: 'Ayarlar',
      general: 'Genel',
      application: 'Uygulama',
      naming: 'İsimlendirme',
      about: 'Hakkında',
      
      // General Tab
      defaultConversionSettings: 'Varsayılan Dönüşüm Ayarları',
      defaultFormat: 'Varsayılan Çıkış Formatı',
      outputFormat: 'Çıktı Formatı',
      defaultQuality: 'Varsayılan Kalite',
      preserveMetadata: 'Metadata Koru',
      metadataDesc: 'EXIF ve renk profil bilgileri',
      metadataFullDesc: 'EXIF, IPTC ve XMP verilerini koru',
      autoSaveLocation: 'Otomatik Kayıt Konumu',
      autoSaveLocationLabel: 'Otomatik Kaydetme Konumu',
      selectFolder: 'Klasör Seç',
      select: 'Seç',
      notSelected: 'Seçilmedi',
      folderNotSelected: 'Klasör seçilmedi (Her seferinde sor)',
      askEveryTime: 'Her seferinde sor',
      locationHint: 'Boş bırakırsanız, her dönüştürme işleminde konum sorulur',
      formatDescriptions: {
        jpg: 'Küçük boyut, yaygın kullanım',
        png: 'Şeffaflık desteği',
        webp: 'Modern, iyi sıkıştırma',
        avif: 'En yeni format',
        tiff: 'Profesyonel, kayıpsız'
      },
      qualityLow: 'Düşük (Küçük dosya)',
      qualityHigh: 'Yüksek (Kaliteli)',
      
      // Application Tab
      appPreferences: 'Uygulama Tercihleri',
      theme: 'Tema',
      darkMode: 'Gece Modu',
      darkModeDesc: 'Koyu renk teması',
      lightMode: 'Gündüz Modu',
      lightModeDesc: 'Açık renk teması',
      language: 'Dil',
      languageDesc: 'Uygulama dilini değiştir',
      turkish: 'Türkçe',
      english: 'English',
      notifications: 'Bildirimler',
      notificationsDesc: 'İşlem tamamlandığında bildir',
      autoUpdate: 'Otomatik Güncelleme',
      autoUpdateDesc: 'Yeni sürümleri otomatik indir',
      confirmExit: 'Çıkış Onayı',
      confirmExitDesc: 'Uygulamadan çıkarken onay iste',
      
      // Naming Tab
      namingPattern: 'İsimlendirme Deseni',
      patternPlaceholder: 'Örnek: {name}-converted',
      addTimestamp: 'Zaman Damgası Ekle',
      timestampDesc: 'Dosya adına tarih/saat ekle',
      preserveOriginal: 'Orijinal İsmi Koru',
      preserveOriginalDesc: 'Kaynak dosya adını değiştirme',
      
      // About Tab
      version: 'Versiyon',
      description: 'Profesyonel görsel dönüştürme ve optimizasyon uygulaması. Format dönüştürme, boyut küçültme, renk uzayı dönüşümü ve filigran ekleme özellikleriyle görsellerinizi yönetin.',
      technologies: 'Teknolojiler',
      copyright: '© 2026 Görsel Dönüştürücü. Tüm hakları saklıdır.',
      
      // Actions
      save: 'Kaydet',
      cancel: 'İptal',
      reset: 'Varsayılana Dön',
      
      // Messages
      saveSuccess: 'Ayarlar Kaydedildi',
      saveSuccessMsg: 'Tüm ayarlarınız başarıyla kaydedildi.',
      resetConfirm: 'Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?',
      resetSuccess: 'Ayarlar Sıfırlandı',
      resetSuccessMsg: 'Tüm ayarlar varsayılan değerlere döndürüldü.'
    },

    // Common
    common: {
      back: 'Geri',
      next: 'İleri',
      finish: 'Bitir',
      close: 'Kapat',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      remove: 'Kaldır',
      select: 'Seç',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Tümünü Kaldır',
      upload: 'Yükle',
      download: 'İndir',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi',
      processing: 'işleniyor',
      completed: 'tamamlandı',
      convert: 'Dönüştür',
      active: 'Aktif',
      inactive: 'Pasif',
      updating: 'Güncelleniyor...',
      saving: 'Kaydediliyor...',
      optional: 'Opsiyonel'
    },

    // Batch Processing
    batchProcessing: {
      title: 'Dosyalar İşleniyor {current}/{total}',
      filesCompleted: 'dosya tamamlandı',
      optimizing: 'Dosya boyutu optimize ediliyor...',
      iteration: 'İterasyon {current}/{total} (Kalite: {quality})',
      cancelButton: 'İşlemi Durdur',
      cancelling: 'İptal ediliyor...',
      cancelled: 'İşlem durduruldu',
      cancelledMessage: 'Şu ana kadar {count} dosya işlendi',
      chunkProgress: 'Küme {current}/{total} işleniyor...',
      filesDuplicated: '{count} dosya aynı isimde olduğu için numaralandırıldı (örn: dosya (1).jpg)',
      pause: 'Durdur',
      resume: 'Devam Et',
      cancel: 'İptal Et',
      paused: 'Duraklatıldı',
      processingFiles: 'Dosyalar İşleniyor',
      pausedMessage: 'Kaldığınız yerden devam edebilirsiniz',
      fileCountWarning: {
        title: 'Çok Sayıda Dosya',
        message: '{count} dosya seçildi. İşlem uzun sürebilir ve sistem yavaşlayabilir.',
        subtitle: 'Devam etmek istiyor musunuz?',
        continue: 'Devam Et',
        cancel: 'İptal'
      }
    },

    // Profile Page
    profilePage: {
      title: 'Profil Ayarları',
      subtitle: 'Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin',
      tabs: {
        profile: 'Profil Bilgileri',
        security: 'Güvenlik',
        sessions: 'Aktif Cihazlar',
        statistics: 'İstatistikler'
      },
      personalInfo: 'Kişisel Bilgiler',
      fullName: 'Ad Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      company: 'Şirket',
      save: 'Kaydet',
      cancel: 'İptal',
      updateSuccess: 'Profil bilgileriniz güncellendi',
      updateError: 'Profil güncellenirken bir hata oluştu',
      changePassword: 'Şifre Değiştir',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Şifreyi Onayla',
      updatePassword: 'Şifreyi Güncelle',
      passwordUpdated: 'Şifreniz başarıyla güncellendi',
      passwordError: 'Şifre güncellenirken bir hata oluştu',
      twoFactor: 'İki Faktörlü Kimlik Doğrulama',
      twoFactorDesc: 'Hesabınıza ekstra güvenlik katmanı ekleyin',
      enable2FA: 'Aktifleştir',
      disable2FA: 'Devre Dışı Bırak',
      enabled: 'Aktif',
      disabled: 'Pasif',
      qrCode: 'QR Kodu',
      qrCodeDesc: 'Google Authenticator veya benzeri bir uygulama ile QR kodu tarayın',
      manualEntry: 'Manuel Giriş',
      secret: 'Gizli Anahtar',
      copySecret: 'Anahtarı Kopyala',
      copied: 'Kopyalandı!',
      verificationCode: 'Doğrulama Kodu',
      verify: 'Doğrula',
      activeSessions: 'Aktif Cihazlar',
      deviceName: 'Cihaz Adı',
      lastActive: 'Son Aktif',
      ipAddress: 'IP Adresi',
      currentDevice: 'Mevcut Cihaz',
      endSession: 'Oturumu Sonlandır',
      endAllSessions: 'Tüm Oturumları Sonlandır',
      
      // Statistics Tab
      customDate: 'Özel Tarih',
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      clear: 'Temizle',
      apply: 'Uygula',
      categoryFilter: 'Kategori Filtresi',
      allOperations: '🔍 Tüm İşlemler',
      formatConversionCategory: '📄 Format Dönüştürme',
      resizeCategory: '📏 Boyut Küçültme',
      colorspaceCategory: '🎨 Renk Uzayı Dönüşümü',
      watermarkCategory: '💧 Filigran Ekleme',
      totalOperations: 'Toplam İşlem',
      spaceSaved: 'Kazanılan Alan',
      formatConversions: 'Format Dönüştürme',
      watermarksAdded: 'Filigran Eklendi',
      formatConversionsDetail: 'Format Dönüştürmeleri',
      files: 'dosya',
      resizeOperations: 'Boyut Küçültme',
      colorspaceConversions: 'Renk Uzayı Dönüşümleri',
      watermarkOperations: 'Filigran İşlemleri',
      filesWatermarked: 'dosyaya filigran',
      tile: 'Döşeme',
      single: 'Tekli',
      operationHistory: 'İşlem Geçmişi',
      operations: 'işlem',
      date: 'Tarih',
      category: 'Kategori',
      details: 'Detaylar',
      fileCount: 'Dosya Sayısı',
      savings: 'Kazanım',
      formatConversionName: 'Format Dönüştürme',
      resizeName: 'Boyut Küçültme',
      colorspaceName: 'Renk Uzayı',
      watermarkName: 'Filigran',
      operationName: 'İşlem',
      targetSize: 'Hedef Boyut',
      percentage: 'Yüzde',
      dimension: 'Boyut',
      noOperationsInPeriod: 'Bu dönemde işlem yapılmamış',
      noFormatConversionInPeriod: 'Bu dönemde format dönüştürme yapılmamış',
      noResizeInPeriod: 'Bu dönemde boyut küçültme yapılmamış',
      noColorspaceInPeriod: 'Bu dönemde renk uzayı dönüşümü yapılmamış',
      noWatermarkInPeriod: 'Bu dönemde filigran ekleme yapılmamış',
      noOperationInPeriod: 'Bu dönemde işlem yapılmamış',
      noOperationsToday: 'Bugün henüz işlem yapmadınız.',
      noOperationsThisWeek: 'Bu hafta henüz işlem yapmadınız.',
      noOperationsThisMonth: 'Bu ay henüz işlem yapmadınız.',
      noOperationsTodayCategory: 'Bugün bu kategoride henüz işlem yapmadınız.',
      noOperationsThisWeekCategory: 'Bu hafta bu kategoride henüz işlem yapmadınız.',
      noOperationsThisMonthCategory: 'Bu ay bu kategoride henüz işlem yapmadınız.',
      companyPlaceholder: 'Şirket adı',
      twoFactorAuthDesc: 'Giriş yaparken telefonunuzdaki authenticator uygulamasından 6 haneli kod girmeniz gerekecek.',
      sessionWarning: '💡 Tanımadığınız bir cihaz görüyorsanız, hemen şifrenizi değiştirin ve o oturumu sonlandırın.',
      endSessionConfirmTitle: 'Oturumu Sonlandır',
      endSessionConfirmMessage: 'Bu cihazdan çıkış yapmak istediğinizden emin misiniz? Tekrar giriş yapmanız gerekecek.'
    },

    // License Modal
    license: {
      title: 'Premium\'a Geçin',
      subtitle: 'Sınırsız dönüştürme ve profesyonel özellikler',
      monthly: 'Aylık',
      yearly: 'Yıllık',
      mostPopular: 'EN POPÜLER',
      savings: '%33 tasarruf',
      perMonth: 'ay',
      perYear: 'yıl',
      features: {
        unlimited: 'Sınırsız dönüştürme',
        allFormats: 'Tüm formatlar',
        cmykRgb: 'CMYK ↔ RGB profesyonel dönüşüm',
        bulkProcess: 'Toplu işlem',
        prioritySupport: 'Öncelikli destek',
        autoUpdate: 'Otomatik güncelleme',
        twoMonthsFree: '2 ay hediye',
        futureFeatures: 'Gelecekteki tüm özellikler'
      },
      paymentInfo: 'Ödeme Bilgileri',
      cardNumber: 'Kart Numarası',
      expiryDate: 'AA/YY',
      cvv: 'CVV',
      cardHolderName: 'Kart Sahibinin Adı',
      securityNote: 'Ödeme bilgileriniz SSL ile şifrelenir ve güvenli bir şekilde işlenir. Kart bilgilerinizi saklamıyoruz.',
      purchaseNow: 'Şimdi Satın Al',
      processing: 'İşleniyor...',
      termsAndConditions: 'Kullanım Şartları',
      privacyPolicy: 'Gizlilik Politikası',
      agreeText: 'Satın alarak',
      and: 've',
      acceptText: '\'nı kabul etmiş olursunuz.',
      activated: 'Lisans Aktifleştirildi!',
      enjoyPremium: 'Premium özelliklerin keyfini çıkarın.'
    },

    // Watermark tile patterns
    tilePatterns: {
      diagonal: 'Çapraz',
      diagonalReverse: 'Ters Çapraz',
      grid: 'Düz Grid',
      dense: 'Sık Aralıklı'
    },

    // Notifications
    notifications: {
      noFiles: 'Lütfen dönüştürmek için dosya seçin.',
      conversionSuccess: 'Dönüştürme Başarılı',
      conversionError: 'Dönüştürme Hatası',
      batchComplete: 'Toplu Dönüştürme Tamamlandı',
      filesConverted: 'dosya dönüştürüldü.',
      error: 'Hata',
      success: 'Başarılı',
      completed: 'Tamamlandı',
      limitReached: 'Limit Doldu',
      needPremium: 'Devam etmek için premium lisans satın alın',
      electronNotFound: 'Electron API bulunamadı',
      noFileSelected: 'Dosya Seçilmedi',
      pleaseSelectFile: 'Lütfen dosya seçin',
      fileNameConflict: 'Dosya Adı Çakışması',
      increased: 'büyüdü',
      profileUpdated: 'Profil Güncellendi',
      profileUpdatedMessage: 'Bilgileriniz başarıyla kaydedildi',
      passwordUpdated: 'Şifre Güncellendi',
      passwordUpdatedMessage: 'Yeni şifreniz kaydedildi',
      twoFactorEnabled: 'İki faktörlü doğrulama başarıyla aktifleştirildi',
      twoFactorDisabled: '2FA Devre Dışı',
      twoFactorDisabledMessage: 'İki faktörlü doğrulama kapatıldı',
      passwordsDoNotMatch: 'Şifreler eşleşmiyor',
      convertedTo: 'dönüştürüldü',
      registrationSuccess: 'Kayıt Başarılı! 🎉',
      emailVerificationSent: 'Email adresinize bir doğrulama linki gönderdik. Lütfen email kutunuzu kontrol edin ve hesabınızı aktifleştirin.',
      enterSixDigitCode: '6 haneli kod girin',
      sessionEnded: 'Oturum Sonlandırıldı',
      sessionEndedMessage: 'Cihaz oturumu başarıyla sonlandırıldı'
    },

    // Terms and Conditions
    terms: {
      title: 'Kullanım Şartları',
      backButton: 'Geri Dön',
      lastUpdated: 'Son Güncelleme',
      acceptance: {
        title: '1. Kabul ve Onay',
        content1: 'Görsel Dönüştürücü uygulamasını kullanarak, bu kullanım şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.',
        content2: 'Bu şartları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.'
      },
      service: {
        title: '2. Hizmet Tanımı',
        content: 'Görsel Dönüştürücü, kullanıcılara çeşitli görsel dosya formatları arasında dönüşüm yapma imkanı sunan bir masaüstü uygulamasıdır. Hizmetlerimiz şunları içerir:',
        feature1: 'Görsel format dönüşümü (PNG, JPG, WebP, SVG vb.)',
        feature2: 'Görsel boyutlandırma ve yeniden ölçeklendirme',
        feature3: 'Renk uzayı dönüşümü (RGB, CMYK)',
        feature4: 'Filigran ekleme ve toplu işleme',
        feature5: 'Çoklu görsel işleme özellikleri'
      },
      accounts: {
        title: '3. Kullanıcı Hesapları',
        content: 'Uygulamayı kullanmak için bir hesap oluşturmanız gerekmektedir. Hesap oluştururken:',
        rule1: 'Doğru ve güncel bilgiler sağlamalısınız',
        rule2: 'Hesap güvenliğinden siz sorumlusunuz',
        rule3: 'Şifrenizi kimseyle paylaşmamalısınız',
        rule4: 'Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz'
      },
      usage: {
        title: '4. Kullanım Kuralları',
        content: 'Uygulamayı kullanırken aşağıdaki davranışlar kesinlikle yasaktır:',
        prohibition1: 'Yasadışı içerik işleme veya paylaşma',
        prohibition2: 'Telif hakkı ihlali içeren görselleri işleme',
        prohibition3: 'Uygulamanın güvenlik sistemlerini aşmaya çalışma',
        prohibition4: 'Otomatik araçlar veya scriptler kullanarak hizmeti kötüye kullanma',
        prohibition5: 'Başkalarının hesaplarına yetkisiz erişim sağlama'
      },
      privacy: {
        title: '5. Gizlilik ve Veri Güvenliği',
        content: 'Gizliliğiniz bizim için önemlidir:',
        point1: 'İşlediğiniz görseller sunucularımızda saklanmaz',
        point2: 'Tüm işlemler yerel cihazınızda gerçekleşir',
        point3: 'Kişisel verileriniz şifrelenerek korunur',
        point4: 'Verilerinizi üçüncü taraflarla paylaşmayız'
      },
      pricing: {
        title: '6. Ücretlendirme ve Lisans',
        content: 'Uygulama farklı lisans seçenekleri sunar:',
        point1: 'Ücretsiz kullanıcılar sınırlı işlem hakkına sahiptir (5 işlem)',
        point2: 'Premium üyelik sınırsız işlem imkanı sağlar',
        point3: 'Ödemeler güvenli ödeme sistemleri üzerinden gerçekleşir',
        point4: 'İptal ve iade politikası ödeme sayfasında belirtilmiştir'
      },
      disclaimer: {
        title: '7. Sorumluluk Reddi',
        content: 'Görsel Dönüştürücü, hizmetin kesintisiz veya hatasız olacağını garanti etmez. İşlediğiniz görsellerin kalitesinden ve içeriğinden siz sorumlusunuz. Uygulama kullanımından kaynaklanan herhangi bir veri kaybı veya hasar için sorumluluk kabul etmemekteyiz.'
      },
      changes: {
        title: '8. Değişiklikler',
        content: 'Bu kullanım şartlarında değişiklik yapma hakkını saklı tutarız. Önemli değişiklikler yapıldığında kullanıcılar bilgilendirilecektir.'
      },
      contact: {
        title: '9. İletişim',
        content: 'Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:'
      },
      footer: 'Bu kullanım şartları, uygulamayı kullanırken tüm kullanıcılar için geçerlidir.'
    },

    // Privacy Policy
    privacy: {
      title: 'Gizlilik Politikası',
      backButton: 'Geri Dön',
      lastUpdated: 'Son Güncelleme',
      intro: {
        title: '1. Giriş',
        content1: 'Görsel Dönüştürücü olarak gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına önem veriyoruz.',
        content2: 'Bu gizlilik politikası, uygulamayı kullanırken hangi bilgilerin toplandığını, nasıl kullanıldığını ve korunduğunu açıklamaktadır.'
      },
      dataCollection: {
        title: '2. Toplanan Bilgiler',
        content: 'Uygulamayı kullanırken aşağıdaki bilgileri topluyoruz:',
        personalTitle: 'Kişisel Bilgiler:',
        personal1: 'Ad ve Soyad',
        personal2: 'E-posta adresi',
        personal3: 'Hesap şifresi (şifrelenmiş olarak saklanır)',
        usageTitle: 'Kullanım Verileri:',
        usage1: 'İşlem geçmişi (format dönüşümleri, boyutlandırma işlemleri vb.)',
        usage2: 'Uygulama kullanım istatistikleri',
        usage3: 'Cihaz bilgileri (işletim sistemi, uygulama versiyonu)'
      },
      dataUsage: {
        title: '3. Verilerin Kullanımı',
        content: 'Topladığımız verileri şu amaçlarla kullanıyoruz:',
        purpose1: 'Hesabınızı oluşturmak ve yönetmek',
        purpose2: 'Hizmetlerimizi sağlamak ve geliştirmek',
        purpose3: 'Kullanıcı deneyimini iyileştirmek',
        purpose4: 'Teknik destek sağlamak',
        purpose5: 'Önemli güncellemeler ve değişiklikler hakkında bilgilendirme yapmak'
      },
      imageProcessing: {
        title: '4. Görsel Dosyaların İşlenmesi',
        important: 'ÖNEMLİ: Gizliliğiniz Garantidir',
        localProcessing: 'Tüm görsel işleme işlemleri yerel cihazınızda gerçekleşir. Görselleriniz asla sunucularımıza yüklenmez.',
        point1: 'İşlediğiniz görseller sadece cihazınızda kalır',
        point2: 'Hiçbir görsel verisi internet üzerinden iletilmez',
        point3: 'Görsel içeriklerinize erişimimiz yoktur'
      },
      dataSecurity: {
        title: '5. Veri Güvenliği',
        content: 'Verilerinizin güvenliğini sağlamak için şu önlemleri alıyoruz:',
        measure1: 'SSL/TLS şifreleme ile veri iletimi',
        measure2: 'Güvenli veritabanı şifreleme',
        measure3: 'Düzenli güvenlik güncellemeleri',
        measure4: 'Erişim kontrol sistemleri'
      },
      cookies: {
        title: '6. Çerezler (Cookies)',
        content: 'Uygulama deneyiminizi iyileştirmek için çerezler kullanıyoruz:',
        type1: 'Oturum çerezleri: Giriş durumunuzu korur',
        type2: 'Tercih çerezleri: Dil ve tema ayarlarınızı saklar',
        type3: 'Analitik çerezler: Kullanım istatistiklerini toplar'
      },
      thirdParty: {
        title: '7. Üçüncü Taraf Hizmetler',
        content: 'Uygulamamız aşağıdaki üçüncü taraf hizmetleri kullanmaktadır:',
        service1: 'Supabase: Kimlik doğrulama ve veritabanı hizmetleri',
        service2: 'Stripe: Güvenli ödeme işlemleri (planlanmış)'
      },
      userRights: {
        title: '8. Kullanıcı Hakları',
        content: 'Verileriniz üzerinde aşağıdaki haklara sahipsiniz:',
        right1: 'Verilerinize erişim hakkı',
        right2: 'Verilerin düzeltilmesini talep etme hakkı',
        right3: 'Verilerin silinmesini talep etme hakkı (unutulma hakkı)',
        right4: 'Veri işlemeye itiraz etme hakkı',
        right5: 'Veri taşınabilirliği hakkı'
      },
      changes: {
        title: '9. Politika Değişiklikleri',
        content: 'Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda e-posta ile bilgilendirileceksiniz.'
      },
      contact: {
        title: '10. İletişim',
        content: 'Gizlilik politikası veya verileriniz hakkında sorularınız için:'
      },
      footer: 'Bu gizlilik politikası, verilerin toplanması, kullanılması ve korunması hakkında tam bilgi sağlar.'
    }
  },

  en: {
    // Errors
    errors: {
      electronApiNotFound: 'Electron API not found.'
    },

    // Header
    header: {
      title: 'Image Converter',
      subtitle: 'Professional Image Processing',
      usageCount: 'Usage Available',
      unlimited: 'Unlimited',
      upgradeToPremium: 'Upgrade to Premium',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      home: 'Home',
      premium: 'Premium',
      freeUsage: 'Free Usage',
      user: 'User',
      freeUsageLimitReached: 'Your free conversion limit has been reached. Purchase a premium license to continue.',
      login: 'Login',
      downloadDesktop: 'Download Desktop',
      download: 'Download'
    },

    // Auth Pages
    auth: {
      // Login Page
      login: {
        welcome: 'Welcome',
        subtitle: 'Sign in to Image Converter',
        email: 'Email',
        emailPlaceholder: 'example@email.com',
        password: 'Password',
        passwordPlaceholder: '••••••••',
        forgotPassword: 'Forgot Password',
        rememberMe: 'Remember Me',
        loginButton: 'Sign In',
        loggingIn: 'Signing In...',
        googleLogin: 'Sign in with Google',
        microsoftLogin: 'Sign in with Microsoft',
        orContinueWith: 'or',
        noAccount: 'Don\'t have an account?',
        registerLink: 'Sign Up',
        emailError: 'Please enter a valid email address',
        passwordError: 'Password must be at least 8 characters'
      },
      
      // Register Page
      register: {
        createAccount: 'Create Account',
        subtitle: 'Join Image Converter',
        fullName: 'Full Name',
        fullNamePlaceholder: 'John Doe',
        email: 'Email',
        emailPlaceholder: 'example@email.com',
        password: 'Password',
        passwordPlaceholder: '••••••••',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: '••••••••',
        passwordStrength: 'Password Strength:',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        terms: 'By signing up, you agree to our',
        termsLink: 'Terms of Service',
        and: 'and',
        privacyLink: 'Privacy Policy',
        termsAgree: '',
        registerButton: 'Sign Up',
        registering: 'Creating Account...',
        googleSignup: 'Sign up with Google',
        microsoftSignup: 'Sign up with Microsoft',
        orContinueWith: 'or',
        alreadyHaveAccount: 'Already have an account?',
        loginLink: 'Sign In',
        fullNameError: 'Full name must be at least 2 characters',
        emailError: 'Please enter a valid email address',
        passwordMinError: 'Password must be at least 8 characters',
        passwordUpperError: 'Must contain at least one uppercase letter',
        passwordLowerError: 'Must contain at least one lowercase letter',
        passwordNumberError: 'Must contain at least one number',
        passwordMatchError: 'Passwords do not match',
        registrationSuccess: 'Registration Successful!',
        emailVerificationSent: 'We\'ve sent a verification link to your email address. Please check your inbox.',
        emailNotReceived: 'Didn\'t receive the email? Check your spam/junk folder.',
        backToLogin: 'Back to Login'
      },
      
      // Forgot Password Page
      forgotPassword: {
        title: 'Forgot Password',
        subtitle: 'We\'ll send a password reset link to your email',
        email: 'Email',
        emailPlaceholder: 'example@email.com',
        sendButton: 'Send Reset Link',
        sending: 'Sending...',
        backToLogin: 'Back to Login',
        emailError: 'Please enter a valid email address',
        emailSentTitle: 'Email Sent! ✉️',
        emailSentTo: 'We sent a password reset link to',
        emailSentMessage: 'Please check your inbox.',
        emailNotReceived: 'Didn\'t receive the email? Check your spam/junk folder or wait a few minutes.'
      },

      // Footer
      footer: {
        copyright: '© 2026 Image Converter. All rights reserved.'
      }
    },

    // Landing Page
    landing: {
      // Hero Section
      hero: {
        badge: '🎨 Professional Image Processing Tool',
        title: 'Transform Your Images',
        titleHighlight: 'Professional Quality',
        subtitle: 'Format conversion, compression, color space transformation, and watermarking. All in one place, fast and easy.',
        feature1: '✓ Multiple format support',
        feature2: '✓ Batch processing',
        feature3: '✓ Professional quality',
        ctaFree: 'Start Free',
        ctaLogin: 'Sign In',
        trustBadge: 'No credit card required • 10 free conversions per week'
      },

      // Footer Links
      footer: {
        features: 'Features',
        pricing: 'Pricing',
        faq: 'FAQ',
        about: 'About Us',
        contact: 'Contact',
        blog: 'Blog',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        description: 'Professional image conversion and optimization tool. Fast and reliable solution for web, mobile, and desktop applications.',
        productTitle: 'Product',
        companyTitle: 'Company',
        legalTitle: 'Legal'
      },

      // Premium Section
      premium: {
        sectionBadge: 'Premium Benefits',
        title: 'Do More',
        subtitle: 'Boost your productivity with unlimited operations and premium support',
        freePlan: 'Free',
        freePrice: '$0',
        premiumPlan: 'Premium',
        premiumPrice: '$14.99',
        perMonth: '/month',
        popular: 'MOST POPULAR',
        
        // Free Plan Features
        weeklyLimit: '10 operations per week',
        allFormats: 'All formats (JPG, PNG, WebP, AVIF, TIFF)',
        formatConversion: 'Format conversion',
        resizeCompress: 'Resize and compress',
        cmykConversion: 'CMYK ↔ RGB conversion',
        watermarkAdd: 'Add watermark',
        batchProcessing: 'Batch processing',
        qualitySettings: 'Quality settings',
        
        // Premium Plan Features
        unlimitedOperations: 'UNLIMITED operations',
        allFeatures: 'All features',
        prioritySupport: 'Priority support',
        adFree: 'Ad-free experience',
        cloudStorage: 'Cloud storage',
        
        upgradeButton: 'Upgrade to Premium',
        currentPlan: 'Current Plan',
        loading: 'Loading...',
        checkoutError: 'Failed to start checkout. Please try again.',
        bottomNote: 'Cancel anytime • Secure payment'
      },

      // Features Section
      features: {
        badge: 'Powerful Features',
        title: 'Tools for Every Need',
        subtitle: 'Everything you need for professional image processing',
        feature1Title: 'Fast Processing',
        feature1Desc: 'Instant conversion with optimized performance',
        feature2Title: 'Batch Processing',
        feature2Desc: 'Process hundreds of files at once',
        feature3Title: 'Safe and Private',
        feature3Desc: 'Your files stay only on your device',
        feature4Title: 'Cloud Storage',
        feature4Desc: 'Save processed files in the cloud',
        feature5Title: 'Professional Quality',
        feature5Desc: 'Lossless conversion and optimization',
        feature6Title: 'Data Protection',
        feature6Desc: 'Preserve EXIF and metadata',
        feature7Title: 'Auto Updates',
        feature7Desc: 'Always the latest features',
        feature8Title: 'Offline Mode',
        feature8Desc: 'No internet connection required'
      },

      // How It Works Section
      howItWorks: {
        badge: 'How It Works',
        title: 'Complete in 3 Steps',
        subtitle: 'Image processing has never been this easy',
        step1Title: 'Upload Files',
        step1Desc: 'Add your images via drag-and-drop or file selection. Batch upload supported.',
        step2Title: 'Configure Settings',
        step2Desc: 'Adjust format, quality, size, and other options according to your needs.',
        step3Title: 'Download',
        step3Desc: 'Download your processed files instantly or save them in the cloud.',
        bottomText: 'Professional results in minutes'
      },

      // Stats Section
      stats: {
        badge: 'Statistics',
        title: 'Our Success in Numbers',
        subtitle: 'The platform trusted by thousands of users',
        stat1Value: '10,000+',
        stat1Label: 'Active Users',
        stat2Value: '1M+',
        stat2Label: 'Processed Images',
        stat3Value: '99.9%',
        stat3Label: 'Success Rate',
        stat4Value: '4.9/5',
        stat4Label: 'User Rating'
      },

      // FAQ Section
      faq: {
        badge: 'FAQ',
        title: 'Frequently Asked Questions',
        subtitle: 'Answers to the most common questions',
        q1: 'How many conversions can I do with the free plan?',
        a1: 'The free plan includes 10 conversions per week. Upgrade to Premium for unlimited conversions.',
        q2: 'Are my files safe?',
        a2: 'Yes, all processing happens on your device. Your files are not uploaded to our servers and stay only on your device.',
        q3: 'Which formats do you support?',
        a3: 'JPG, PNG, and WebP formats are supported in the free plan. Premium plan also includes TIFF and AVIF formats.',
        q4: 'How does batch processing work?',
        a4: 'You can select multiple files and process them at once. Premium users can process 100+ files simultaneously.',
        q5: 'Can I cancel my Premium plan?',
        a5: 'Yes, you can cancel your premium plan anytime. After cancellation, you continue to enjoy premium features until the end of the current billing period.',
        q6: 'Does it work offline?',
        a6: 'Yes, our desktop application works completely offline. You can do all operations without an internet connection.',
        bottomText: 'Have a question?',
        contactLink: 'Contact us'
      },

      // CTA Section
      cta: {
        badge: 'Get Started Now',
        title: 'Start Professional Image Processing',
        subtitle: 'Create a free account and enjoy 10 free conversions per week',
        benefit1: '✓ No credit card required',
        benefit2: '✓ Start instantly',
        benefit3: '✓ Cancel anytime',
        benefit4: '✓ 24/7 support',
        button: 'Start Free',
        trustBadge: 'Trusted by thousands • Safe and fast'
      },

      // Tools Section
      tools: {
        title: 'Select your preferred tool to edit your images',
        subtitle: 'Transform your designs quickly and with high quality using our online editor',
        startNow: 'Start →',
        trialInfo: 'Free trial: 10 operations per week',
        formatConversion: {
          title: 'Format Conversion',
          description: 'Convert between JPG, PNG, WebP, AVIF, TIFF formats',
          feature1: 'JPG ↔ PNG',
          feature2: 'WebP Support',
          feature3: 'AVIF/TIFF'
        },
        resize: {
          title: 'Resize & Compress',
          description: 'Optimize by setting target size (KB)',
          feature1: 'Target Size (KB)',
          feature2: 'Auto Quality',
          feature3: 'Optimize'
        },
        colorspace: {
          title: 'Color Space',
          description: 'RGB and CMYK conversion',
          feature1: 'RGB (Screen)',
          feature2: 'CMYK (Print)',
          feature3: 'ICC Profile'
        },
        watermark: {
          title: 'Add Watermark',
          description: 'Watermark with shadow and tile support',
          feature1: 'Text Watermark',
          feature2: 'Shadow Effect',
          feature3: 'Tile Pattern'
        },
        allInOne: {
          title: 'All-in-One',
          description: 'Use all features at once',
          feature1: 'Format + Size',
          feature2: 'Color + Watermark',
          feature3: 'Batch Process'
        }
      }
    },

    // HomePage
    home: {
      title: 'Image Converter',
      subtitle: 'Speed up your work with professional image processing tools',
      selectOperation: 'Select an operation',
      features: {
        formatConversion: {
          title: 'Format Conversion',
          description: 'Convert your images to different formats'
        },
        resize: {
          title: 'Resize & Compress',
          description: 'Optimize file size and quality'
        },
        colorspace: {
          title: 'Color Space Conversion',
          description: 'Convert between RGB and CMYK'
        },
        watermark: {
          title: 'Add Watermark',
          description: 'Add custom watermark to your images'
        },
        multi: {
          title: 'All in One',
          description: 'Use all features together'
        }
      },
      tips: {
        title: 'Tip',
        single: 'If you want to do a single operation, select the relevant card',
        multiple: 'Use "All in One" option to do multiple operations at once',
        batch: 'All operations support batch processing'
      },
      popular: 'Popular'
    },

    // FormatConversion
    formatConversion: {
      title: 'Format Conversion',
      subtitle: 'Convert your images to different formats',
      selectFormat: 'Output Format',
      selectedFormat: 'Selected format',
      convert: 'Convert',
      converting: 'Processing...',
      formats: {
        jpg: { name: 'JPG', description: 'Most common format, small size' },
        png: { name: 'PNG', description: 'Transparency support, high quality' },
        webp: { name: 'WEBP', description: 'Modern, optimized size' },
        avif: { name: 'AVIF', description: 'Next-gen, excellent compression' },
        tiff: { name: 'TIFF', description: 'Professional, lossless' },
        bmp: { name: 'BMP', description: 'Simple bitmap format' },
        gif: { name: 'GIF', description: 'Animation support' }
      }
    },

    // Resize
    resize: {
      title: 'Resize & Compress',
      subtitle: 'Optimize file size and quality',
      optimizationSettings: 'Optimization Settings',
      quality: 'Quality',
      lowQuality: 'Low Quality (Small Size)',
      highQuality: 'High Quality (Large Size)',
      targetSize: 'Target File Size (Optional)',
      example: 'Ex: 500',
      targetSizeHint: 'Enter target value to reduce below a specific size',
      howItWorks: 'How It Works?',
      howItWorksItem1: 'File size is reduced by lowering quality',
      howItWorksItem2: 'If target size is entered, quality is adjusted until that size is reached',
      howItWorksItem3: 'Original format is preserved (JPG → JPG, PNG → PNG)',
      optimizeButton: 'Optimize',
      optimized: 'optimized',
      reduced: 'reduced',
      filesOptimized: 'files optimized',
      pngTargetSizeWarningTitle: 'PNG + Target Size Warning',
      pngTargetSizeWarning: 'PNG is a lossless format and is not compatible with target file size feature. The file size may not decrease to the target value, or may even increase. For size reduction, use JPEG, WebP, or AVIF formats in the format conversion page.'
    },

    // ColorSpace
    colorSpace: {
      title: 'Color Space Conversion',
      subtitle: 'Convert between RGB and CMYK',
      targetColorSpace: 'Target Color Space',
      selectColorSpace: 'Color Space',
      rgbItem1: 'Ideal for digital images',
      rgbItem2: 'Screen display',
      rgbItem3: 'Web and social media',
      cmykItem1: 'For print jobs',
      cmykItem2: 'Professional printing',
      cmykItem3: 'Catalogs, brochures, posters',
      conversionInfo: 'Conversion Info',
      conversionInfoText: 'Conversion is done to the selected color space. RGB for digital, CMYK for print. Color profiles are automatically adjusted.',
      convert: 'Convert',
      converting: 'Processing...',
      converted: 'converted',
      filesConverted: 'files converted',
      cmykWarning: {
        title: 'CMYK Format Warning',
        message: 'Your selected files ({formats}) do not support CMYK color space. To convert to CMYK, you need to convert your files to TIFF or JPEG format first.',
        action: 'Go to Format Conversion'
      },
      options: {
        rgb: { name: 'RGB', description: 'Ideal for digital screens' },
        cmyk: { name: 'CMYK', description: 'Professional for print jobs' }
      }
    },

    // Watermark
    watermark: {
      title: 'Add Watermark',
      subtitle: 'Add custom watermark to your images',
      settings: 'Watermark Settings',
      text: 'Watermark Text',
      textPlaceholder: 'Ex: © 2026 Your Name',
      placeholder: 'Enter your text',
      position: 'Position',
      topLeft: 'Top Left',
      topRight: 'Top Right',
      bottomLeft: 'Bottom Left',
      bottomRight: 'Bottom Right',
      center: 'Center',
      opacity: 'Opacity',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      autoScale: 'Automatically scales relative to image width',
      color: 'Text Color',
      gray: 'Gray',
      white: 'White',
      black: 'Black',
      red: 'Red',
      shadow: 'Shadow',
      shadowDesc: 'Makes text more visible',
      tileMode: 'Tile Mode',
      tileModeDesc: 'Repeated watermark across entire screen',
      preview: 'Preview',
      positions: {
        topLeft: 'Top Left',
        topRight: 'Top Right',
        center: 'Center',
        bottomLeft: 'Bottom Left',
        bottomRight: 'Bottom Right'
      },
      apply: 'Add Watermark',
      applying: 'Processing...',
      addButton: 'Add Watermark',
      textMissing: 'Watermark Text Missing',
      pleaseEnterText: 'Please enter watermark text',
      added: 'watermark added',
      filesProcessed: 'files processed with watermark'
    },

    // WatermarkPreview
    watermarkPreview: {
      livePreview: 'Live Preview',
      watermarkActive: 'Watermark Active',
      preview: 'Preview',
      enterWatermarkText: '✏️ Enter your watermark text on the right',
      imageSize: '📐 Image Size:',
      watermarkFont: '✏️ Watermark Font:',
      liveUpdateTip: '💡 Preview updates instantly when you change settings'
    },

    // Multi
    multi: {
      title: 'All in One',
      subtitle: 'Use all features together',
      process: 'Process',
      processing: 'Processing...'
    },

    // Stats Panel
    stats: {
      title: 'Statistics',
      totalConversions: 'Total Conversions',
      sizeSaved: 'Size Saved',
      avgCompression: 'Avg. Compression',
      noConversions: 'No conversions yet'
    },

    // Conversion Panel
    conversionPanel: {
      title: '⚙️ Conversion Settings',
      outputFormat: 'Output Format',
      quality: 'Quality',
      targetFileSize: 'Target File Size (KB) - Optional',
      targetFileSizeHint: 'If left blank, only quality setting will be used',
      watermarkTitle: '🎨 Watermark',
      watermarkText: 'Watermark Text',
      watermarkPlaceholder: 'Ex: © 2026 Your Name',
      opacity: 'Opacity',
      fontSize: 'Font Size',
      fontSizePlaceholder: 'Ex: 500',
      fontFamily: 'Font Family',
      textColor: 'Text Color',
      position: 'Position',
      shadow: 'Shadow',
      shadowHint: 'Enhances visibility',
      convert: 'Convert',
      bulkConvert: '🚀 Bulk Convert ({count})',
      processing: 'Processing...',
      cmykInfo: 'CMYK → RGB conversion is done with professional ICC profiles',
      formats: {
        jpeg: 'JPEG (.jpg)',
        png: 'PNG (.png)',
        webp: 'WebP (.webp)',
        avif: 'AVIF (.avif) 🔥 Next Gen',
        tiff: 'TIFF (.tiff)',
        bmp: 'BMP (.bmp)'
      },
      positions: {
        topLeft: 'Top Left',
        topRight: 'Top Right',
        bottomLeft: 'Bottom Left',
        bottomRight: 'Bottom Right',
        center: 'Center'
      },
      colors: {
        gray: 'Gray',
        white: 'White',
        black: 'Black',
        red: 'Red'
      },
      colorSpaceOptions: {
        dontConvert: 'Don\'t Convert (Original)',
        toRgb: 'Convert to RGB (Professional)',
        toCmyk: 'Convert to CMYK (Basic)'
      },
      preserveMetadata: 'Preserve Metadata',
      metadataInfo: 'EXIF and color profile information',
      addWatermark: 'Add Watermark',
      addWatermarkDesc: 'Add text watermark to image',
      fontSizeSmall: 'Small (%2)',
      fontSizeMedium: 'Medium (%5)',
      fontSizeLarge: 'Large (%15)',
      autoScaleHint: 'Auto scaled based on image width',
      grayColorTip: 'Tip: Gray color is visible on both dark and light images',
      shadowTip: 'Shadow makes text more visible but doesn\'t change the text color',
      tileMode: 'Tile Mode',
      tileModeDesc: 'Repeated watermark across entire screen',
      pngTargetSizeWarningTitle: 'PNG + Target Size Warning',
      pngTargetSizeWarning: 'PNG is a lossless format and is not compatible with target file size feature. The file size may not decrease to the target value, or may even increase. For size reduction, please prefer JPEG, WebP, or AVIF formats.',
      notifications: {
        error: 'Error',
        electronNotFound: 'Electron API not found',
        limitReached: 'Limit Reached',
        limitMessage: 'Free limit reached. Upgrade to Premium.',
        noFilesSelected: 'No Files Selected',
        noFilesMessage: 'Please select at least one file',
        noFormatSelected: 'No Format Selected',
        noFormatMessage: 'Please select an output format',
        conversionSuccess: 'Conversion Successful',
        successMessage: 'files successfully converted',
        bulkConversionComplete: 'Bulk Conversion Complete',
        bulkSuccessMessage: 'files successfully converted',
        paused: 'Paused',
        pausedMessage: 'Processing paused. You can resume.',
        cancelled: 'Cancelled',
        cancelledMessage: 'processed'
      }
    },

    // FileUploadZone
    fileUpload: {
      dragDrop: 'Drag & drop files or click',
      supportedFormats: 'Supported formats',
      maxSize: 'Maximum file size',
      selectFiles: 'Select Files',
      tipTitle: 'Tip:',
      tipText: 'You can select multiple files at once or batch process.',
      invalidFile: 'Invalid File',
      selectValidFiles: 'Please select valid image files.',
      someFilesSkipped: 'Some Files Skipped',
      invalidFilesSkipped: '{count} invalid files skipped.',
      filesAdded: 'Files Added',
      filesAddedSuccess: '{count} files successfully added.',
      fileSelectError: 'An error occurred while selecting files.'
    },

    // FileList
    fileList: {
      title: 'File List',
      showing: 'showing',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selected: 'selected',
      clearAll: 'Clear All',
      saved: 'saved',
      reduced: 'reduced',
      increased: 'increased',
      loadMore: 'Load More',
      moreFiles: 'more files',
      remaining: 'Remaining',
      files: 'files'
    },

    // Settings
    settings: {
      title: 'Settings',
      general: 'General',
      application: 'Application',
      naming: 'Naming',
      about: 'About',
      
      // General Tab
      defaultConversionSettings: 'Default Conversion Settings',
      defaultFormat: 'Default Output Format',
      outputFormat: 'Output Format',
      defaultQuality: 'Default Quality',
      preserveMetadata: 'Preserve Metadata',
      metadataDesc: 'EXIF and color profile information',
      metadataFullDesc: 'Preserve EXIF, IPTC and XMP data',
      autoSaveLocation: 'Auto Save Location',
      autoSaveLocationLabel: 'Auto Save Location',
      selectFolder: 'Select Folder',
      select: 'Select',
      notSelected: 'Not Selected',
      folderNotSelected: 'No folder selected (Ask every time)',
      askEveryTime: 'Ask every time',
      locationHint: 'If left blank, location will be asked for each conversion',
      formatDescriptions: {
        jpg: 'Small size, common usage',
        png: 'Transparency support',
        webp: 'Modern, good compression',
        avif: 'Newest format',
        tiff: 'Professional, lossless'
      },
      qualityLow: 'Low (Small file)',
      qualityHigh: 'High (Quality)',
      
      // Application Tab
      appPreferences: 'Application Preferences',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Dark color theme',
      lightMode: 'Light Mode',
      lightModeDesc: 'Light color theme',
      language: 'Language',
      languageDesc: 'Change application language',
      turkish: 'Türkçe',
      english: 'English',
      notifications: 'Notifications',
      notificationsDesc: 'Notify when operation is complete',
      autoUpdate: 'Auto Update',
      autoUpdateDesc: 'Automatically download new versions',
      confirmExit: 'Confirm Exit',
      confirmExitDesc: 'Ask for confirmation when exiting',
      
      // Naming Tab
      namingPattern: 'Naming Pattern',
      patternPlaceholder: 'Example: {name}-converted',
      addTimestamp: 'Add Timestamp',
      timestampDesc: 'Add date/time to filename',
      preserveOriginal: 'Preserve Original Name',
      preserveOriginalDesc: 'Do not change source filename',
      
      // About Tab
      version: 'Version',
      description: 'Professional image conversion and optimization application. Manage your images with format conversion, resizing, color space conversion and watermark features.',
      technologies: 'Technologies',
      copyright: '© 2026 Image Converter. All rights reserved.',
      
      // Actions
      save: 'Save',
      cancel: 'Cancel',
      reset: 'Reset to Default',
      
      // Messages
      saveSuccess: 'Settings Saved',
      saveSuccessMsg: 'All your settings have been successfully saved.',
      resetConfirm: 'Are you sure you want to reset all settings to default?',
      resetSuccess: 'Settings Reset',
      resetSuccessMsg: 'All settings have been reset to default values.'
    },

    // Common
    common: {
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      select: 'Select',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      upload: 'Upload',
      download: 'Download',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      processing: 'processing',
      completed: 'completed',
      convert: 'Convert',
      active: 'Active',
      inactive: 'Inactive',
      updating: 'Updating...',
      saving: 'Saving...',
      optional: 'Optional'
    },

    // Batch Processing
    batchProcessing: {
      title: 'Processing Files {current}/{total}',
      filesCompleted: 'files completed',
      optimizing: 'Optimizing file size...',
      iteration: 'Iteration {current}/{total} (Quality: {quality})',
      cancelButton: 'Stop Processing',
      cancelling: 'Cancelling...',
      cancelled: 'Processing stopped',
      cancelledMessage: '{count} files processed so far',
      chunkProgress: 'Processing chunk {current}/{total}...',
      filesDuplicated: '{count} files were renamed due to duplicate names (e.g., file (1).jpg)',
      pause: 'Pause',
      resume: 'Resume',
      cancel: 'Cancel',
      paused: 'Paused',
      processingFiles: 'Processing Files',
      pausedMessage: 'You can resume from where you left off',
      fileCountWarning: {
        title: 'Large File Count',
        message: '{count} files selected. Processing may take a long time and slow down your system.',
        subtitle: 'Do you want to continue?',
        continue: 'Continue',
        cancel: 'Cancel'
      }
    },

    // Profile Page
    profilePage: {
      title: 'Profile Settings',
      subtitle: 'Manage your account information and security settings',
      tabs: {
        profile: 'Profile Information',
        security: 'Security',
        sessions: 'Active Devices',
        statistics: 'Statistics'
      },
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      email: 'E-mail',
      phone: 'Phone',
      company: 'Company',
      save: 'Save',
      cancel: 'Cancel',
      updateSuccess: 'Your profile has been updated',
      updateError: 'An error occurred while updating profile',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update Password',
      passwordUpdated: 'Your password has been successfully updated',
      passwordError: 'An error occurred while updating password',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security to your account',
      enable2FA: 'Enable',
      disable2FA: 'Disable',
      enabled: 'Active',
      disabled: 'Inactive',
      qrCode: 'QR Code',
      qrCodeDesc: 'Scan the QR code with Google Authenticator or similar app',
      manualEntry: 'Manual Entry',
      secret: 'Secret Key',
      copySecret: 'Copy Secret',
      copied: 'Copied!',
      verificationCode: 'Verification Code',
      verify: 'Verify',
      activeSessions: 'Active Devices',
      deviceName: 'Device Name',
      lastActive: 'Last Active',
      ipAddress: 'IP Address',
      currentDevice: 'Current Device',
      endSession: 'End Session',
      endAllSessions: 'End All Sessions',
      
      // Statistics Tab
      customDate: 'Custom Date',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      clear: 'Clear',
      apply: 'Apply',
      categoryFilter: 'Category Filter',
      allOperations: '🔍 All Operations',
      formatConversionCategory: '📄 Format Conversion',
      resizeCategory: '📏 Resize & Compress',
      colorspaceCategory: '🎨 Color Space Conversion',
      watermarkCategory: '💧 Add Watermark',
      totalOperations: 'Total Operations',
      spaceSaved: 'Space Saved',
      formatConversions: 'Format Conversions',
      watermarksAdded: 'Watermarks Added',
      formatConversionsDetail: 'Format Conversions',
      files: 'files',
      resizeOperations: 'Resize & Compress',
      colorspaceConversions: 'Color Space Conversions',
      watermarkOperations: 'Watermark Operations',
      filesWatermarked: 'files watermarked',
      tile: 'Tile',
      single: 'Single',
      operationHistory: 'Operation History',
      operations: 'operations',
      date: 'Date',
      category: 'Category',
      details: 'Details',
      fileCount: 'File Count',
      savings: 'Savings',
      formatConversionName: 'Format Conversion',
      resizeName: 'Resize',
      colorspaceName: 'Color Space',
      watermarkName: 'Watermark',
      operationName: 'Operation',
      targetSize: 'Target Size',
      percentage: 'Percentage',
      dimension: 'Dimension',
      noOperationsInPeriod: 'No operations in this period',
      noFormatConversionInPeriod: 'No format conversion operations in this period',
      noResizeInPeriod: 'No resize operations in this period',
      noColorspaceInPeriod: 'No color space conversion operations in this period',
      noWatermarkInPeriod: 'No watermark operations in this period',
      noOperationInPeriod: 'No operations in this period',
      noOperationsToday: 'No operations today.',
      noOperationsThisWeek: 'No operations this week.',
      noOperationsThisMonth: 'No operations this month.',
      noOperationsTodayCategory: 'No operations in this category today.',
      noOperationsThisWeekCategory: 'No operations in this category this week.',
      noOperationsThisMonthCategory: 'No operations in this category this month.',
      companyPlaceholder: 'Company name',
      twoFactorAuthDesc: 'You will need to enter a 6-digit code from the authenticator app on your phone when logging in.',
      sessionWarning: '💡 If you see an unrecognized device, change your password immediately and end that session.',
      endSessionConfirmTitle: 'End Session',
      endSessionConfirmMessage: 'Are you sure you want to sign out from this device? You will need to sign in again.'
    },

    // License Modal
    license: {
      title: 'Upgrade to Premium',
      subtitle: 'Unlimited conversions and professional features',
      monthly: 'Monthly',
      yearly: 'Yearly',
      mostPopular: 'MOST POPULAR',
      savings: '33% savings',
      perMonth: 'month',
      perYear: 'year',
      features: {
        unlimited: 'Unlimited conversions',
        allFormats: 'All formats',
        cmykRgb: 'CMYK ↔ RGB professional conversion',
        bulkProcess: 'Bulk processing',
        prioritySupport: 'Priority support',
        autoUpdate: 'Auto update',
        twoMonthsFree: '2 months free',
        futureFeatures: 'All future features'
      },
      paymentInfo: 'Payment Information',
      cardNumber: 'Card Number',
      expiryDate: 'MM/YY',
      cvv: 'CVV',
      cardHolderName: 'Cardholder Name',
      securityNote: 'Your payment information is encrypted with SSL and processed securely. We do not store your card information.',
      purchaseNow: 'Purchase Now',
      processing: 'Processing...',
      termsAndConditions: 'Terms and Conditions',
      privacyPolicy: 'Privacy Policy',
      agreeText: 'By purchasing, you agree to',
      and: 'and',
      acceptText: '.',
      activated: 'License Activated!',
      enjoyPremium: 'Enjoy premium features.'
    },

    // Watermark tile patterns
    tilePatterns: {
      diagonal: 'Diagonal',
      diagonalReverse: 'Reverse Diagonal',
      grid: 'Straight Grid',
      dense: 'Dense'
    },

    // Notifications
    notifications: {
      noFiles: 'Please select files to convert.',
      conversionSuccess: 'Conversion Successful',
      conversionError: 'Conversion Error',
      batchComplete: 'Batch Conversion Completed',
      filesConverted: 'files converted.',
      error: 'Error',
      success: 'Success',
      completed: 'Completed',
      limitReached: 'Limit Reached',
      needPremium: 'Purchase premium license to continue',
      electronNotFound: 'Electron API not found',
      noFileSelected: 'No File Selected',
      pleaseSelectFile: 'Please select a file',
      fileNameConflict: 'File Name Conflict',
      increased: 'increased',
      profileUpdated: 'Profile Updated',
      profileUpdatedMessage: 'Your information has been successfully saved',
      passwordUpdated: 'Password Updated',
      passwordUpdatedMessage: 'Your new password has been saved',
      twoFactorEnabled: 'Two-factor authentication successfully enabled',
      twoFactorDisabled: '2FA Disabled',
      twoFactorDisabledMessage: 'Two-factor authentication disabled',
      passwordsDoNotMatch: 'Passwords do not match',
      convertedTo: 'converted to',
      registrationSuccess: 'Registration Successful! 🎉',
      emailVerificationSent: 'We\'ve sent a verification link to your email address. Please check your inbox and activate your account.',
      enterSixDigitCode: 'Enter 6-digit code',
      sessionEnded: 'Session Ended',
      sessionEndedMessage: 'Device session successfully ended'
    },

    // Terms and Conditions
    terms: {
      title: 'Terms and Conditions',
      backButton: 'Go Back',
      lastUpdated: 'Last Updated',
      acceptance: {
        title: '1. Acceptance and Agreement',
        content1: 'By using the Image Converter application, you acknowledge that you have read, understood, and agree to these terms of service.',
        content2: 'If you do not agree to these terms, please do not use the application.'
      },
      service: {
        title: '2. Service Description',
        content: 'Image Converter is a desktop application that provides users with the ability to convert between various image file formats. Our services include:',
        feature1: 'Image format conversion (PNG, JPG, WebP, SVG, etc.)',
        feature2: 'Image resizing and rescaling',
        feature3: 'Color space conversion (RGB, CMYK)',
        feature4: 'Watermarking and batch processing',
        feature5: 'Multiple image processing features'
      },
      accounts: {
        title: '3. User Accounts',
        content: 'You must create an account to use the application. When creating an account:',
        rule1: 'You must provide accurate and current information',
        rule2: 'You are responsible for account security',
        rule3: 'You must not share your password with anyone',
        rule4: 'You are responsible for all activities that occur under your account'
      },
      usage: {
        title: '4. Usage Rules',
        content: 'The following behaviors are strictly prohibited when using the application:',
        prohibition1: 'Processing or sharing illegal content',
        prohibition2: 'Processing images that violate copyright',
        prohibition3: 'Attempting to bypass the application\'s security systems',
        prohibition4: 'Abusing the service using automated tools or scripts',
        prohibition5: 'Gaining unauthorized access to others\' accounts'
      },
      privacy: {
        title: '5. Privacy and Data Security',
        content: 'Your privacy is important to us:',
        point1: 'Images you process are not stored on our servers',
        point2: 'All processing occurs on your local device',
        point3: 'Your personal data is encrypted and protected',
        point4: 'We do not share your data with third parties'
      },
      pricing: {
        title: '6. Pricing and Licensing',
        content: 'The application offers different licensing options:',
        point1: 'Free users have limited processing rights (5 operations)',
        point2: 'Premium membership provides unlimited processing',
        point3: 'Payments are processed through secure payment systems',
        point4: 'Cancellation and refund policy is stated on the payment page'
      },
      disclaimer: {
        title: '7. Disclaimer',
        content: 'Image Converter does not guarantee that the service will be uninterrupted or error-free. You are responsible for the quality and content of the images you process. We do not accept responsibility for any data loss or damage resulting from the use of the application.'
      },
      changes: {
        title: '8. Changes',
        content: 'We reserve the right to modify these terms of service. Users will be notified when significant changes are made.'
      },
      contact: {
        title: '9. Contact',
        content: 'For questions about the terms of service, you can contact us:'
      },
      footer: 'These terms of service apply to all users when using the application.'
    },

    // Privacy Policy
    privacy: {
      title: 'Privacy Policy',
      backButton: 'Go Back',
      lastUpdated: 'Last Updated',
      intro: {
        title: '1. Introduction',
        content1: 'At Image Converter, we respect your privacy and are committed to protecting your personal data.',
        content2: 'This privacy policy explains what information is collected when using the application, how it is used, and how it is protected.'
      },
      dataCollection: {
        title: '2. Information Collected',
        content: 'When using the application, we collect the following information:',
        personalTitle: 'Personal Information:',
        personal1: 'Full Name',
        personal2: 'Email address',
        personal3: 'Account password (stored encrypted)',
        usageTitle: 'Usage Data:',
        usage1: 'Operation history (format conversions, resizing operations, etc.)',
        usage2: 'Application usage statistics',
        usage3: 'Device information (operating system, application version)'
      },
      dataUsage: {
        title: '3. Use of Data',
        content: 'We use the collected data for the following purposes:',
        purpose1: 'To create and manage your account',
        purpose2: 'To provide and improve our services',
        purpose3: 'To enhance user experience',
        purpose4: 'To provide technical support',
        purpose5: 'To inform you about important updates and changes'
      },
      imageProcessing: {
        title: '4. Image File Processing',
        important: 'IMPORTANT: Your Privacy is Guaranteed',
        localProcessing: 'All image processing operations occur on your local device. Your images are never uploaded to our servers.',
        point1: 'Processed images remain only on your device',
        point2: 'No image data is transmitted over the internet',
        point3: 'We have no access to your image content'
      },
      dataSecurity: {
        title: '5. Data Security',
        content: 'We take the following measures to ensure the security of your data:',
        measure1: 'SSL/TLS encryption for data transmission',
        measure2: 'Secure database encryption',
        measure3: 'Regular security updates',
        measure4: 'Access control systems'
      },
      cookies: {
        title: '6. Cookies',
        content: 'We use cookies to improve your application experience:',
        type1: 'Session cookies: Maintains your login status',
        type2: 'Preference cookies: Stores your language and theme settings',
        type3: 'Analytics cookies: Collects usage statistics'
      },
      thirdParty: {
        title: '7. Third-Party Services',
        content: 'Our application uses the following third-party services:',
        service1: 'Supabase: Authentication and database services',
        service2: 'Stripe: Secure payment processing (planned)'
      },
      userRights: {
        title: '8. User Rights',
        content: 'You have the following rights regarding your data:',
        right1: 'Right to access your data',
        right2: 'Right to request correction of data',
        right3: 'Right to request deletion of data (right to be forgotten)',
        right4: 'Right to object to data processing',
        right5: 'Right to data portability'
      },
      changes: {
        title: '9. Policy Changes',
        content: 'We may update this privacy policy from time to time. You will be notified by email when significant changes occur.'
      },
      contact: {
        title: '10. Contact',
        content: 'For questions about the privacy policy or your data:'
      },
      footer: 'This privacy policy provides complete information about the collection, use, and protection of data.'
    }
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');

  // LocalStorage'dan dil yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.language) {
          setLanguage(settings.language);
        }
      } catch (error) {
        console.error('Language loading error:', error);
      }
    }
  }, []);

  // Dil değiştiğinde LocalStorage'ı güncelle
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    
    // LocalStorage'daki ayarları güncelle
    const savedSettings = localStorage.getItem('appSettings');
    let settings = {};
    
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Settings parse error:', error);
      }
    }
    
    settings.language = newLanguage;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  // Çeviri al (parametre desteği ile)
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // Parametreleri değiştir (örn: {formats} → PNG, WebP)
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }
    
    return value;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
