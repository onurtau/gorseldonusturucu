import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
  // Dosya yönetimi - Her sayfa için ayrı dosya listesi
  files: {
    'format-conversion': [],
    'resize': [],
    'colorspace': [],
    'watermark': [],
    'multi': []
  },
  selectedFiles: {
    'format-conversion': [],
    'resize': [],
    'colorspace': [],
    'watermark': [],
    'multi': []
  },
  
  addFiles: (newFiles) => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.files[activeView]) return state; // home veya diğer view'larda dosya ekleme yok
    
    const newFileObjects = newFiles.map((file, index) => ({
      ...file,
      id: `${Date.now()}-${index}`,
      status: 'bekliyor', // bekliyor, işleniyor, tamamlandı, hata
      progress: 0,
      result: null
    }));
    
    // Yeni dosyaları otomatik seç
    const newFileIds = newFileObjects.map(f => f.id);
    
    const updatedFiles = [...state.files[activeView], ...newFileObjects];
    
    // 50+ dosya uyarısı kontrolü
    if (updatedFiles.length >= 50 && !state.ui.fileCountWarningShown) {
      return {
        files: {
          ...state.files,
          [activeView]: updatedFiles
        },
        selectedFiles: {
          ...state.selectedFiles,
          [activeView]: [...state.selectedFiles[activeView], ...newFileIds]
        },
        ui: {
          ...state.ui,
          showFileCountWarning: true,
          fileCountWarningData: { count: updatedFiles.length, view: activeView }
        }
      };
    }
    
    return {
      files: {
        ...state.files,
        [activeView]: updatedFiles
      },
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: [...state.selectedFiles[activeView], ...newFileIds]
      }
    };
  }),
  
  removeFile: (fileId) => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.files[activeView]) return state;
    
    return {
      files: {
        ...state.files,
        [activeView]: state.files[activeView].filter(f => f.id !== fileId)
      },
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: state.selectedFiles[activeView].filter(id => id !== fileId)
      }
    };
  }),
  
  clearFiles: () => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.files[activeView]) return state;
    
    return {
      files: {
        ...state.files,
        [activeView]: []
      },
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: []
      }
    };
  }),
  
  updateFileStatus: (fileId, status, progress = 0, result = null) => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.files[activeView]) return state;
    
    return {
      files: {
        ...state.files,
        [activeView]: state.files[activeView].map(f => 
          f.id === fileId ? { ...f, status, progress, result } : f
        )
      }
    };
  }),
  
  toggleFileSelection: (fileId) => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.selectedFiles[activeView]) return state;
    
    return {
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: state.selectedFiles[activeView].includes(fileId)
          ? state.selectedFiles[activeView].filter(id => id !== fileId)
          : [...state.selectedFiles[activeView], fileId]
      }
    };
  }),
  
  selectAllFiles: () => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.files[activeView]) return state;
    
    return {
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: state.files[activeView].map(f => f.id)
      }
    };
  }),
  
  deselectAllFiles: () => set((state) => {
    const activeView = state.ui.activeView;
    if (!state.selectedFiles[activeView]) return state;
    
    return {
      selectedFiles: {
        ...state.selectedFiles,
        [activeView]: []
      }
    };
  }),
  
  // Dönüşüm ayarları
  conversionSettings: {
    outputFormat: 'jpg',
    quality: 90,
    targetSize: null, // KB cinsinden
    convertColorSpace: null, // 'rgb', 'cmyk', null
    preserveMetadata: true,
    outputFolder: null,
    // Watermark ayarları
    watermark: {
      enabled: false,
      text: '',
      position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
      opacity: 0.5,
      fontSizePercent: 3,  // Görsel genişliğinin %3'ü (2-15% arası ayarlanabilir)
      fontFamily: 'Impact',  // Varsayılan: En popüler watermark fontu
      color: '#808080',  // Varsayılan Gri (hem koyu hem açık görsellerde görünür)
      shadow: false,  // Gölgelendirme efekti
      // Döşeme özellikleri
      tileEnabled: false,  // Tüm ekrana döşeme modu
      tilePattern: 'diagonal'  // 'diagonal', 'diagonal-reverse', 'grid', 'dense'
    }
  },
  
  updateConversionSettings: (settings) => set((state) => ({
    conversionSettings: { ...state.conversionSettings, ...settings }
  })),
  
  // Lisans yönetimi
  license: {
    hasLicense: false,
    isActive: false,
    usageCount: 0,
    freeLimit: 50,
    canUse: true
  },
  
  setLicense: (licenseData) => set({ license: licenseData }),
  
  incrementUsage: () => set((state) => ({
    license: {
      ...state.license,
      usageCount: state.license.usageCount + 1,
      canUse: state.license.hasLicense || state.license.usageCount + 1 < state.license.freeLimit
    }
  })),
  
  // UI durumu
  ui: {
    activeView: 'home', // home, format-conversion, resize, colorspace, watermark, multi
    activeTab: 'donustur', // donustur, toplu, ayarlar
    showLicenseModal: false,
    showSettingsModal: false,
    isBatchProcessing: false,
    batchProgress: { current: 0, total: 0 },
    iterationProgress: { current: 0, total: 0, quality: 0 }, // Binary search iteration progress
    isCancelling: false, // Batch işlemi iptal etme flag
    isPaused: false, // Batch işlemi duraklatma flag
    pausedAtIndex: 0, // Hangi dosya indexinde durdu
    totalFilesInBatch: 0, // Toplam işlenecek dosya sayısı
    showFileCountWarning: false, // 50+ dosya uyarı modal
    fileCountWarningData: { count: 0, view: '' }, // Warning modal data
    fileCountWarningShown: false // Session boyunca bir kere göster
  },
  
  setActiveView: (view) => set((state) => ({
    ui: { ...state.ui, activeView: view }
  })),
  
  setActiveTab: (tab) => set((state) => ({
    ui: { ...state.ui, activeTab: tab }
  })),
  
  toggleLicenseModal: () => set((state) => ({
    ui: { ...state.ui, showLicenseModal: !state.ui.showLicenseModal }
  })),
  
  toggleSettingsModal: () => set((state) => ({
    ui: { ...state.ui, showSettingsModal: !state.ui.showSettingsModal }
  })),
  
  setBatchProcessing: (isProcessing) => set((state) => ({
    ui: { ...state.ui, isBatchProcessing: isProcessing }
  })),
  
  updateBatchProgress: (current, total) => set((state) => ({
    ui: {
      ...state.ui,
      batchProgress: { current, total }
    }
  })),
  
  updateIterationProgress: (current, total, quality = 0) => set((state) => ({
    ui: {
      ...state.ui,
      iterationProgress: { current, total, quality }
    }
  })),
  
pauseBatchProcessing: () => set((state) => ({
    ui: {
      ...state.ui,
      isPaused: true
    }
  })),

  resumeBatchProcessing: () => set((state) => ({
    ui: {
      ...state.ui,
      isPaused: false
    }
  })),

  setPausedAtIndex: (index) => set((state) => ({
    ui: {
      ...state.ui,
      pausedAtIndex: index
    }
  })),

  setTotalFilesInBatch: (total) => set((state) => ({
    ui: {
      ...state.ui,
      totalFilesInBatch: total
    }
  })),

  cancelBatchProcessing: () => set((state) => ({
    ui: {
      ...state.ui,
      isCancelling: true,
      isPaused: false,
      isBatchProcessing: false,
      pausedAtIndex: 0,
      totalFilesInBatch: 0
    }
  })),
  
  resetCancelFlag: () => set((state) => ({
    ui: {
      ...state.ui,
      isCancelling: false
    }
  })),
  
  setShowFileCountWarning: (show) => set((state) => ({
    ui: {
      ...state.ui,
      showFileCountWarning: show
    }
  })),
  
  confirmFileCountWarning: () => set((state) => ({
    ui: {
      ...state.ui,
      showFileCountWarning: false,
      fileCountWarningShown: true // Session boyunca bir daha gösterme
    }
  })),
  
  // Bildirim sistemi
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          type: 'info', // success, error, warning, info
          ...notification,
          timestamp: new Date()
        }
      ]
    }));
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  // İstatistikler
  stats: {
    totalConverted: 0,
    totalSizeSaved: 0,
    averageCompressionRatio: 0,
    // Detaylı istatistikler
    operations: [] // { id, timestamp, type, details }
  },
  
  updateStats: (newData) => set((state) => {
    const stats = state.stats;
    const totalConverted = stats.totalConverted + 1;
    const sizeSaved = isNaN(newData.sizeSaved) ? 0 : (newData.sizeSaved || 0);
    const totalSizeSaved = stats.totalSizeSaved + sizeSaved;
    const compressionRatio = isNaN(newData.compressionRatio) ? 0 : (newData.compressionRatio || 0);
    const averageCompressionRatio = 
      (stats.averageCompressionRatio * stats.totalConverted + compressionRatio) / totalConverted;
    
    return {
      stats: {
        ...state.stats,
        totalConverted,
        totalSizeSaved,
        averageCompressionRatio
      }
    };
  }),
  
  // Detaylı istatistik kaydı
  recordStatistic: (type, details) => set((state) => {
    const operation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type, // 'format-conversion', 'resize', 'colorspace', 'watermark'
      details // İşleme özgü detaylar
    };
    
    return {
      stats: {
        ...state.stats,
        operations: [...state.stats.operations, operation]
      }
    };
  }),
  
  // İstatistikleri temizle
  clearStatistics: () => set((state) => ({
    stats: {
      totalConverted: 0,
      totalSizeSaved: 0,
      averageCompressionRatio: 0,
      operations: []
    }
  })),

  // Tüm state'i sıfırla (stats hariç - kullanıcı geçmişi korunur)
  resetAppState: () => set((state) => ({
    // Tüm sayfaların dosyalarını temizle
    files: {
      'format-conversion': [],
      'resize': [],
      'colorspace': [],
      'watermark': [],
      'multi': []
    },
    selectedFiles: {
      'format-conversion': [],
      'resize': [],
      'colorspace': [],
      'watermark': [],
      'multi': []
    },
    
    // Dönüşüm ayarlarını varsayılana döndür
    conversionSettings: {
      outputFormat: 'jpg',
      quality: 90,
      targetSize: null,
      convertColorSpace: null,
      preserveMetadata: true,
      outputFolder: null,
      watermark: {
        enabled: false,
        text: '',
        position: 'bottom-right',
        opacity: 0.5,
        fontSizePercent: 3,
        fontFamily: 'Impact',
        color: '#808080',
        shadow: false,
        tileEnabled: false,
        tilePattern: 'diagonal'
      }
    },
    
    // UI'ı sıfırla
    ui: {
      activeView: 'home',
      activeTab: 'donustur',
      showLicenseModal: false,
      showSettingsModal: false,
      isBatchProcessing: false,
      batchProgress: { current: 0, total: 0 },
      iterationProgress: { current: 0, total: 0, quality: 0 },
      isCancelling: false,
      isPaused: false,
      pausedAtIndex: 0,
      totalFilesInBatch: 0,
      showFileCountWarning: false,
      fileCountWarningData: { count: 0, view: '' },
      fileCountWarningShown: false
    },
    
    // Bildirimleri temizle
    notifications: [],
    
    // License ve stats KORUNUR (değiştirilmez)
    // license: state.license, (zaten değişmediği için belirtmeye gerek yok)
    // stats: state.stats (KORUNUR - kullanıcı geçmişi)
  }))
    }),
    {
      name: 'app-statistics-storage',
      partialize: (state) => ({
        // Sadece bu alanları persist et (localStorage'a kaydet)
        stats: state.stats,
        license: state.license
      })
    }
  )
);

export default useAppStore;
