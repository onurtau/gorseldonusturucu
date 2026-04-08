import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Sparkles, Settings, Crown, Home, User, LogOut, ChevronDown } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';

const Header = React.memo(() => {
  const { license, toggleLicenseModal, toggleSettingsModal, ui, setActiveView } = useAppStore();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Profil menüsü dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo ve Başlık */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveView('home')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-xl">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                  {t('header.title')}
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h1>
                <p className="text-sm text-gray-400">{t('header.subtitle')}</p>
              </div>
            </button>
            
            {/* Ana Sayfa Butonu (eğer ana sayfada değilse) */}
            {ui.activeView !== 'home' && (
              <button
                onClick={() => setActiveView('home')}
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-gray-300 hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">{t('header.home')}</span>
              </button>
            )}
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center space-x-4">
            {/* Lisans Durumu */}
            <div className="flex items-center space-x-3">
              {license.hasLicense && license.isActive ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-lg">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">{t('header.premium')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('header.freeUsage')}</p>
                    <p className="text-sm font-semibold">
                      {license.usageCount} / {license.freeLimit}
                    </p>
                  </div>
                  <button
                    onClick={toggleLicenseModal}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-all btn-hover-scale flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    {t('header.upgradeToPremium')}
                  </button>
                </div>
              )}
            </div>

            {/* Ayarlar Butonu */}
            <button
              onClick={toggleSettingsModal}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              title={t('header.settings')}
            >
              <Settings className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>

            {/* Profil Menüsü */}
            {isAuthenticated && user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-dark-700 rounded-lg transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Kullanıcı Adı */}
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors hidden md:block">
                    {user.name || user.email}
                  </span>
                  
                  {/* Dropdown Icon */}
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menü */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    {/* Kullanıcı Bilgisi */}
                    <div className="px-4 py-3 border-b border-dark-700">
                      <p className="text-sm font-semibold text-white">
                        {user.name || t('header.user')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Menü Öğeleri */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('header.profile')}</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ücretsiz kullanıcı için uyarı */}
        {!license.hasLicense && license.usageCount >= license.freeLimit && (
          <div className="mt-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ {t('header.freeUsageLimitReached')}
            </p>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
