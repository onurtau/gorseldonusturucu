import React, { useEffect, useState } from 'react';
import useAppStore from './store/useAppStore';
import useAuthStore from './store/useAuthStore';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import LicenseModal from './components/LicenseModal';
import SettingsModal from './components/SettingsModal';
import NotificationContainer from './components/NotificationContainer';
import FloatingPremiumButton from './components/FloatingPremiumButton';
import HomePage from './pages/HomePage';
import MultiPage from './pages/MultiPage';
import FormatConversionPage from './pages/FormatConversionPage';
import ResizePage from './pages/ResizePage';
import ColorSpacePage from './pages/ColorSpacePage';
import WatermarkPage from './pages/WatermarkPage';
import ProfilePage from './pages/ProfilePage';
import AuthRouter from './pages/AuthRouter';
import AuthCallbackPage from './pages/AuthCallbackPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import './index.css';

// Ana içerik komponenti (LanguageProvider içinde kullanılacak)
function AppContent() {
  const { t } = useLanguage();
  const { 
    setLicense, 
    ui, 
    addNotification,
    setShowFileCountWarning,
    confirmFileCountWarning,
    clearFiles,
    updateBatchProgress,
    updateIterationProgress
  } = useAppStore();

  const { 
    isAuthenticated, 
    isInitialized, 
    initialize, 
    setupAuthListener,
    setOnlineStatus 
  } = useAuthStore();

  const [isCallback, setIsCallback] = useState(false);

  // Theme yönetimi - Sadece authenticated kullanıcılar için
  useEffect(() => {
    // Authenticated kullanıcılar için theme'i localStorage'dan al
    // Public sayfalar her zaman light modda
    if (isAuthenticated) {
      const savedTheme = localStorage.getItem('appSettings');
      let theme = 'light';
      
      if (savedTheme) {
        try {
          const settings = JSON.parse(savedTheme);
          theme = settings.theme || 'light';
        } catch (error) {
          console.error('Theme ayarı okunamadı:', error);
        }
      }
      
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(theme);
    } else {
      // Public sayfalar her zaman light mode
      document.body.classList.remove('dark', 'light');
      document.body.classList.add('light');
    }
    
    // Theme değişikliklerini dinle (sadece authenticated kullanıcılar için)
    const handleStorageChange = () => {
      if (isAuthenticated) {
        const updatedSettings = localStorage.getItem('appSettings');
        if (updatedSettings) {
          try {
            const settings = JSON.parse(updatedSettings);
            const newTheme = settings.theme || 'light';
            document.body.classList.remove('dark', 'light');
            document.body.classList.add(newTheme);
          } catch (error) {
            console.error('Theme güncellemesi başarısız:', error);
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Auth sistemi başlat
    initialize();
    
    // Auth state listener kur
    const subscription = setupAuthListener();

    // Online/Offline dinleyicileri
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Electron API kontrolü
    if (!window.electronAPI) {
      console.warn('Electron API bulunamadı. Geliştirme modunda çalışıyor olabilirsiniz.');
      return;
    }

    // Lisans durumunu kontrol et
    const checkLicense = async () => {
      try {
        const licenseData = await window.electronAPI.checkLicense();
        setLicense(licenseData);
        
        if (!licenseData.canUse) {
          addNotification({
            type: 'warning',
            title: t('notifications.limitReached'),
            message: t('notifications.needPremium')
          });
        }
      } catch (error) {
        console.error('Lisans kontrolü hatası:', error);
      }
    };

    checkLicense();

    // Batch progress listener
    if (window.electronAPI?.onBatchProgress) {
      window.electronAPI.onBatchProgress((data) => {
        updateBatchProgress(data.current, data.total);
      });
    }
    
    // Iteration progress listener (binary search progress)
    if (window.electronAPI?.onIterationProgress) {
      window.electronAPI.onIterationProgress((data) => {
        updateIterationProgress(data.current, data.total, data.quality);
      });
    }

    // Uygulama bilgilerini al
    window.electronAPI.getAppInfo?.().then((info) => {
      console.log('Uygulama:', info);
    });

    // OAuth callback kontrolü
    if (window.location.pathname === '/auth/callback') {
      setIsCallback(true);
    }

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialize, setupAuthListener, setOnlineStatus, setLicense, updateBatchProgress, updateIterationProgress, addNotification]);

  // Auth Loading State
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Yükleniyor...</h2>
        </div>
      </div>
    );
  }

  // OAuth Callback Route
  if (isCallback) {
    return <AuthCallbackPage />;
  }

  // Auth Check - Giriş yapılmamışsa Login/Register göster
  if (!isAuthenticated) {
    return <AuthRouter />;
  }

  // Render page based on activeView
  const renderPage = () => {
    switch (ui.activeView) {
      case 'home':
        return <HomePage />;
      case 'multi':
        return <MultiPage />;
      case 'format-conversion':
        return <FormatConversionPage />;
      case 'resize':
        return <ResizePage />;
      case 'colorspace':
        return <ColorSpacePage />;
      case 'watermark':
        return <WatermarkPage />;
      case 'profile':
        return <ProfilePage />;
      case 'terms':
        return <TermsPage onBackToLanding={() => useAppStore.getState().setActiveView('home')} />;
      case 'privacy':
        return <PrivacyPage onBackToLanding={() => useAppStore.getState().setActiveView('home')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Header />
      
      {renderPage()}

      {/* Modals */}
      {ui.showLicenseModal && <LicenseModal />}
      {ui.showSettingsModal && <SettingsModal />}
      
      {/* File Count Warning Modal */}
      {ui.showFileCountWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full mx-4 glass border border-yellow-500/30">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20 mb-4">
                <svg className="h-10 w-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-yellow-500">
                {t('batchProcessing.fileCountWarning.title')}
              </h3>
              <p className="text-gray-300 mb-2">
                {t('batchProcessing.fileCountWarning.message', { count: ui.fileCountWarningData.count })}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {t('batchProcessing.fileCountWarning.subtitle')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    clearFiles();
                    setShowFileCountWarning(false);
                  }}
                  className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  {t('batchProcessing.fileCountWarning.cancel')}
                </button>
                <button
                  onClick={() => confirmFileCountWarning()}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors font-semibold"
                >
                  {t('batchProcessing.fileCountWarning.continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bildirimler */}
      <NotificationContainer />
      
      {/* Floating Premium Button (Sadece mobil) */}
      <FloatingPremiumButton />
    </div>
  );
}

// Ana App komponenti (LanguageProvider wrapper)
function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
