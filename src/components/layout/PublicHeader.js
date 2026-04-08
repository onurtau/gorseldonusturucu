import React from 'react';
import { ImageIcon, Sparkles, Globe, ArrowLeft, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import * as trialManager from '../../services/trialManager';
import logo from '../../assets/logo.png';

const PublicHeader = ({ onLoginClick, onRegisterClick, onBackToLanding }) => {
  const { t, language, changeLanguage } = useLanguage();
  const { user } = useAuthStore();
  
  // Trial bilgisini al (sadece kayıtsız kullanıcılar için)
  const remainingTrials = !user ? trialManager.getRemainingTrials(user) : null;

  // Desktop download handler
  const handleDownloadDesktop = () => {
    // GitHub releases URL
    const downloadUrl = 'https://github.com/onurtau/gorseldonusturucu/releases/download/v1.0.0/GorselDonusturucu-Setup-1.0.0.exe';
    window.open(downloadUrl, '_blank');
  };

  return (
    <header className="bg-white/95 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-1.5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {/* Anasayfaya Dön Butonu */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                title={t('header.home') || 'Anasayfa'}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm hidden sm:inline">{t('header.home') || 'Anasayfa'}</span>
              </button>
            )}
            
            <div className="flex items-center space-x-1.5">
              <img src={logo} alt="Görsel Dönüştürücü" className="w-[60px] h-[60px]" />
              <div>
                <h1 className="text-lg font-bold gradient-text flex items-center gap-1.5">
                  {t('header.title')}
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h1>
                <p className="text-[11px] text-gray-600 hidden sm:block">{t('header.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-3">
            {/* Trial Counter (sadece kayıtsız kullanıcılar için) */}
            {remainingTrials !== null && isFinite(remainingTrials) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-600 font-medium">Ücretsiz Deneme</span>
                  <span className="text-sm font-bold text-blue-900">{remainingTrials} / 50</span>
                </div>
              </div>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium text-sm">{language === 'tr' ? 'TR' : 'EN'}</span>
            </button>

            {/* Download Desktop Button */}
            <button
              onClick={handleDownloadDesktop}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
              title={t('header.downloadDesktop')}
            >
              <Download className="w-4 h-4" />
              <span className="font-medium text-sm">{t('header.download')}</span>
            </button>

            {/* Login Button */}
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              {t('header.login')}
            </button>

            {/* Register Button */}
            <button
              onClick={onRegisterClick}
              className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-500/20"
            >
              {language === 'tr' ? 'Premium\'a Geç' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;


