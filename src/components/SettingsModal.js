import React, { useState, useEffect } from 'react';
import { X, Settings, Save, RotateCcw, Info, Bell, Globe, Palette, FolderOpen, FileText, Check, Sun, Moon } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsModal = () => {
  const { toggleSettingsModal, conversionSettings, updateConversionSettings, addNotification } = useAppStore();
  const { t, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  
  // Ayarlar state
  const [settings, setSettings] = useState({
    // Genel
    defaultOutputFormat: conversionSettings.outputFormat || 'jpg',
    defaultQuality: conversionSettings.quality || 90,
    preserveMetadata: conversionSettings.preserveMetadata ?? true,
    autoSaveLocation: conversionSettings.outputFolder || '',
    
    // Uygulama
    language: 'tr',
    theme: 'light',
    notifications: true,
    autoUpdate: true,
    confirmBeforeExit: true,
    
    // İsimlendirme
    defaultNamingPattern: '{name}-converted',
    addTimestamp: false,
    preserveOriginalName: true
  });

  // LocalStorage'dan yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // LocalStorage'a kaydet
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Theme'i uygula
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(settings.theme);
    
    // Dönüşüm ayarlarını güncelle
    updateConversionSettings({
      outputFormat: settings.defaultOutputFormat,
      quality: settings.defaultQuality,
      preserveMetadata: settings.preserveMetadata,
      outputFolder: settings.autoSaveLocation
    });

    addNotification({
      type: 'success',
      title: t('settings.saveSuccess'),
      message: t('settings.saveSuccessMsg')
    });
    
    toggleSettingsModal();
  };

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      const defaultSettings = {
        defaultOutputFormat: 'jpg',
        defaultQuality: 90,
        preserveMetadata: true,
        autoSaveLocation: '',
        language: 'tr',
        theme: 'dark',
        notifications: true,
        autoUpdate: true,
        confirmBeforeExit: true,
        defaultNamingPattern: '{name}-converted',
        addTimestamp: false,
        preserveOriginalName: true
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('appSettings');
      
      // Theme'i dark'a döndür
      document.body.classList.remove('dark', 'light');
      document.body.classList.add('dark');
      
      addNotification({
        type: 'info',
        title: t('settings.resetSuccess'),
        message: t('settings.resetSuccessMsg')
      });
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Dil değişikliğinde anında uygula
    if (key === 'language') {
      changeLanguage(value);
    }
  };

  const handleFolderSelect = async () => {
    if (window.electronAPI?.selectFolder) {
      const result = await window.electronAPI.selectFolder();
      if (!result.canceled && result.filePaths.length > 0) {
        handleChange('autoSaveLocation', result.filePaths[0]);
      }
    }
  };

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Settings },
    { id: 'app', label: t('settings.application'), icon: Palette },
    { id: 'about', label: t('settings.about'), icon: Info }
  ];

  const formats = [
    { value: 'jpg', label: 'JPG', description: t('settings.formatDescriptions.jpg') },
    { value: 'png', label: 'PNG', description: t('settings.formatDescriptions.png') },
    { value: 'webp', label: 'WebP', description: t('settings.formatDescriptions.webp') },
    { value: 'avif', label: 'AVIF', description: t('settings.formatDescriptions.avif') },
    { value: 'tiff', label: 'TIFF', description: t('settings.formatDescriptions.tiff') }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl border border-dark-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
          </div>
          <button
            onClick={toggleSettingsModal}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Tabs */}
          <div className="w-48 bg-dark-900 border-r border-dark-700 p-4">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left
                      ${activeTab === tab.id 
                        ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-30' 
                        : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Genel Ayarlar */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-400" />
                    {t('settings.defaultConversionSettings')}
                  </h3>
                  
                  {/* Varsayılan Format */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-300">
                      {t('settings.outputFormat')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formats.map(format => (
                        <button
                          key={format.value}
                          onClick={() => handleChange('defaultOutputFormat', format.value)}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${settings.defaultOutputFormat === format.value
                              ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                              : 'border-dark-600 hover:border-dark-500'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{format.label}</span>
                            {settings.defaultOutputFormat === format.value && (
                              <Check className="w-4 h-4 text-primary-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{format.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kalite */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-300">
                      {t('settings.defaultQuality')}: <span className="text-primary-400">{settings.defaultQuality}%</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.defaultQuality}
                      onChange={(e) => handleChange('defaultQuality', parseInt(e.target.value))}
                      className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t('settings.qualityLow')}</span>
                      <span>{t('settings.qualityHigh')}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg mb-6">
                    <div>
                      <p className="text-sm font-medium text-white">{t('settings.preserveMetadata')}</p>
                      <p className="text-xs text-gray-500">{t('settings.metadataFullDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.preserveMetadata}
                        onChange={(e) => handleChange('preserveMetadata', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  {/* Otomatik Kaydetme Konumu */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      {t('settings.autoSaveLocationLabel')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.autoSaveLocation}
                        onChange={(e) => handleChange('autoSaveLocation', e.target.value)}
                        placeholder={t('settings.folderNotSelected')}
                        className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={handleFolderSelect}
                        className="px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FolderOpen className="w-5 h-5" />
                        <span className="text-sm">{t('settings.select')}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.locationHint')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Uygulama Ayarları */}
            {activeTab === 'app' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-400" />
                  {t('settings.appPreferences')}
                </h3>

                {/* Tema Seçimi */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    {t('settings.theme')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Dark Mode */}
                    <button
                      onClick={() => handleChange('theme', 'dark')}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${settings.theme === 'dark'
                          ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                          : 'border-dark-600 hover:border-dark-500'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold text-white">{t('settings.darkMode')}</span>
                        </div>
                        {settings.theme === 'dark' && (
                          <Check className="w-5 h-5 text-primary-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{t('settings.darkModeDesc')}</p>
                    </button>

                    {/* Light Mode */}
                    <button
                      onClick={() => handleChange('theme', 'light')}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${settings.theme === 'light'
                          ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                          : 'border-dark-600 hover:border-dark-500'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sun className="w-5 h-5 text-yellow-400" />
                          <span className="font-semibold text-white">{t('settings.lightMode')}</span>
                        </div>
                        {settings.theme === 'light' && (
                          <Check className="w-5 h-5 text-primary-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{t('settings.lightModeDesc')}</p>
                    </button>
                  </div>
                </div>

                {/* Dil */}
                <div className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <p className="text-sm font-medium text-white">{t('settings.language')}</p>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      className="px-3 py-1 bg-dark-600 border border-dark-500 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="tr">{t('settings.turkish')}</option>
                      <option value="en">{t('settings.english')}</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 ml-7">{t('settings.languageDesc')}</p>
                </div>

                {/* Bildirimler */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{t('settings.notifications')}</p>
                      <p className="text-xs text-gray-500">{t('settings.notificationsDesc')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {/* Otomatik Güncelleme */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{t('settings.autoUpdate')}</p>
                    <p className="text-xs text-gray-500">{t('settings.autoUpdateDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoUpdate}
                      onChange={(e) => handleChange('autoUpdate', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {/* Çıkış Onayı */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{t('settings.confirmExit')}</p>
                    <p className="text-xs text-gray-500">{t('settings.confirmExitDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.confirmBeforeExit}
                      onChange={(e) => handleChange('confirmBeforeExit', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Hakkında */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Settings className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Görsel Dönüştürücü</h3>
                  <p className="text-gray-400 mb-6">{t('settings.version')} 1.0.0</p>
                  
                  <div className="max-w-md mx-auto space-y-4 text-sm text-gray-400">
                    <p>
                      {t('settings.description')}
                    </p>
                    
                    <div className="pt-4 border-t border-dark-700 space-y-2">
                      <p className="font-semibold text-white">{t('settings.technologies')}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['Electron', 'React', 'Sharp', 'Tailwind CSS', 'Supabase'].map(tech => (
                          <span key={tech} className="px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dark-700">
                      <p className="text-xs text-gray-500">
                        {t('settings.copyright')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        {activeTab !== 'about' && (
          <div className="p-6 border-t border-dark-700 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('settings.reset')}</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={toggleSettingsModal}
                className="px-6 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-gray-300"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all text-white font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('settings.save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
