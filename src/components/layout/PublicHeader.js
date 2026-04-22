import React, { useState } from 'react';
import { Globe, ArrowLeft, Download, Menu, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import * as trialManager from '../../services/trialManager';

const PublicHeader = ({ onLoginClick, onRegisterClick, onBackToLanding }) => {
  const { t, language, changeLanguage } = useLanguage();
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Trial bilgisini al (sadece kayıtsız kullanıcılar için)
  const remainingTrials = !user ? trialManager.getRemainingTrials(user) : null;

  // Logo path (Electron veya Web)
  const logoSrc = window.electronAPI?.logo || `${process.env.PUBLIC_URL}/logo-192.png`;

  // Desktop download handler
  const handleDownloadDesktop = () => {
    // GitHub releases URL
    const downloadUrl = 'https://github.com/onurtau/gorseldonusturucu/releases/download/v1.0.0/GorselDonusturucu-Setup-1.0.0.exe';
    window.open(downloadUrl, '_blank');
  };

  return (
    <header className="bg-white/95 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-2 sm:px-4 py-1.5 max-w-7xl">
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
              <img 
                src={logoSrc} 
                alt="Zylorpix" 
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <h1 className="text-lg sm:text-xl font-bold gradient-text">
                Zylorpix
              </h1>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Trial Counter (sadece kayıtsız kullanıcılar için) */}
            {remainingTrials !== null && isFinite(remainingTrials) && (
              <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-600 font-medium">Ücretsiz Deneme</span>
                  <span className="text-sm font-bold text-blue-900">{remainingTrials} / 50</span>
                </div>
              </div>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium text-xs sm:text-sm">{language === 'tr' ? 'TR' : 'EN'}</span>
            </button>

            {/* Download Desktop Button */}
            <button
              onClick={handleDownloadDesktop}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
              title={t('header.downloadDesktop')}
            >
              <Download className="w-4 h-4" />
              <span className="font-medium text-sm">{t('header.download')}</span>
            </button>

            {/* Login Button - Desktop Only */}
            <button
              onClick={onLoginClick}
              className="hidden md:block px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-xs sm:text-sm"
            >
              {t('header.login')}
            </button>

            {/* Register Button - Desktop Only */}
            <button
              onClick={onRegisterClick}
              className="hidden md:block px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-500/20 text-xs sm:text-sm"
            >
              {language === 'tr' ? 'Premium\'a Geç' : 'Upgrade to Premium'}
            </button>

            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Mobile Only */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-2 pt-2 pb-3 px-2 space-y-2">
            {/* Login Button */}
            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
            >
              {t('header.login')}
            </button>

            {/* Register/Premium Button */}
            <button
              onClick={() => {
                onRegisterClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-500/20 text-sm"
            >
              {language === 'tr' ? 'Premium\'a Geç' : 'Upgrade to Premium'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;


