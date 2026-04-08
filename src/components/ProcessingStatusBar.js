import React from 'react';
import { Pause, Play, X, Loader } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const ProcessingStatusBar = ({ onResume }) => {
  const { 
    ui, 
    pauseBatchProcessing, 
    resumeBatchProcessing, 
    cancelBatchProcessing 
  } = useAppStore();
  const { t } = useLanguage();

  // Sadece batch processing aktif olduğunda göster
  if (!ui.isBatchProcessing || ui.totalFilesInBatch === 0) {
    return null;
  }

  const progress = ui.totalFilesInBatch > 0 
    ? (ui.batchProgress.current / ui.totalFilesInBatch) * 100 
    : 0;

  const handlePause = () => {
    pauseBatchProcessing();
  };

  const handleResume = () => {
    resumeBatchProcessing();
    // İşlemi yeniden başlat
    if (onResume) {
      onResume();
    }
  };

  const handleCancel = () => {
    cancelBatchProcessing();
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-blue-200 dark:border-blue-900 p-4 mb-4 shadow-lg">
      {/* Başlık ve Progress Bilgisi */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {!ui.isPaused && (
            <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          )}
          {ui.isPaused && (
            <Pause className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          )}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {ui.isPaused ? t('batchProcessing.paused') : t('batchProcessing.processingFiles')}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {ui.batchProgress.current} / {ui.totalFilesInBatch} {t('batchProcessing.filesCompleted')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${
            ui.isPaused 
              ? 'bg-orange-500 dark:bg-orange-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Butonlar */}
      <div className="flex items-center gap-3">
        {/* Pause/Resume Butonu */}
        {!ui.isPaused ? (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Pause className="w-4 h-4" />
            {t('batchProcessing.pause')}
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Play className="w-4 h-4" />
            {t('batchProcessing.resume')}
          </button>
        )}

        {/* İptal Et Butonu */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
        >
          <X className="w-4 h-4" />
          {t('batchProcessing.cancel')}
        </button>

        {/* Durum Mesajı */}
        {ui.isPaused && (
          <span className="ml-auto text-sm text-orange-600 dark:text-orange-400 font-medium">
            {t('batchProcessing.pausedMessage')}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProcessingStatusBar;
