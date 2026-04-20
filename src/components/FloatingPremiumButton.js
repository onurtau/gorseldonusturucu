import React, { useState, useEffect } from 'react';
import { Crown, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const FloatingPremiumButton = () => {
  const { license, toggleLicenseModal } = useAppStore();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Premium kullanıcılar için butonu gösterme
  if (license.hasLicense && license.isActive) {
    return null;
  }

  // Butonu tamamen kapat
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobil için Floating Button */}
      <div className="lg:hidden">
        {isMinimized ? (
          // Minimize edilmiş hali - Sadece ikon
          <button
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-pulse"
            aria-label={t('header.upgradeToPremium')}
          >
            <Crown className="w-7 h-7" />
          </button>
        ) : (
          // Tam hali - İkon + Yazı
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <button
              onClick={toggleLicenseModal}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 font-semibold text-sm"
            >
              <Crown className="w-5 h-5" />
              <span>{t('header.upgradeToPremium')}</span>
            </button>
            
            {/* Minimize butonu */}
            <button
              onClick={() => setIsMinimized(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Küçült"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingPremiumButton;
