import React, { useState, useMemo, useCallback } from 'react';
import { X, Check, Loader, AlertCircle, FileImage, Trash2, ChevronDown } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

// Helper functions - component dışında tanımla (her render'da yeniden oluşmasın)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = React.memo(() => {
  const { 
    files, 
    selectedFiles, 
    ui,
    removeFile, 
    clearFiles, 
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles 
  } = useAppStore();
  const { t } = useLanguage();

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  // Pagination state - İlk 20 dosyayı göster
  const [displayCount, setDisplayCount] = useState(20);
  const ITEMS_PER_PAGE = 20;

  // Status icon ve color helper'ları memoize et
  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case t('common.processing'):
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case t('common.completed'):
        return <Check className="w-5 h-5 text-green-400" />;
      case t('common.error'):
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <FileImage className="w-5 h-5 text-gray-400" />;
    }
  }, [t]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case t('common.processing'):
        return 'border-blue-500';
      case t('common.completed'):
        return 'border-green-500';
      case t('common.error'):
        return 'border-red-500';
      default:
        return 'border-dark-600';
    }
  }, [t]);

  // allSelected ve displayedFiles'ı memoize et
  const allSelected = useMemo(() => 
    activeFiles.length > 0 && activeSelectedFiles.length === activeFiles.length,
    [activeFiles.length, activeSelectedFiles.length]
  );
  
  const displayedFiles = useMemo(() => 
    activeFiles.slice(0, displayCount),
    [activeFiles, displayCount]
  );
  
  const hasMore = useMemo(() => 
    activeFiles.length > displayCount,
    [activeFiles.length, displayCount]
  );
  
  // loadMore fonksiyonunu memoize et
  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, activeFiles.length));
  }, [activeFiles.length, ITEMS_PER_PAGE]);

  // Early return - dosya yoksa hiçbir şey gösterme
  if (activeFiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      {/* Başlık ve Toplu İşlem Butonları */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            📁 {t('fileList.title')} ({activeFiles.length})
            {displayCount < activeFiles.length && (
              <span className="text-sm text-gray-400 ml-2">
                ({displayCount} / {activeFiles.length} {t('fileList.showing')})
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={allSelected ? deselectAllFiles : selectAllFiles}
              className="text-sm px-3 py-1 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-gray-300"
            >
              {allSelected ? t('fileList.deselectAll') : t('fileList.selectAll')}
            </button>
            {activeSelectedFiles.length > 0 && (
              <span className="text-sm text-gray-400">
                ({activeSelectedFiles.length} {t('fileList.selected')})
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={clearFiles}
          className="text-sm px-3 py-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {t('fileList.clearAll')}
        </button>
      </div>

      {/* Dosya Listesi */}
      <div className="divide-y divide-dark-700 max-h-96 overflow-y-auto">
        {displayedFiles.map((file) => (
          <div
            key={file.id}
            className={`
              p-4 hover:bg-dark-700 transition-all cursor-pointer border-l-4
              ${activeSelectedFiles.includes(file.id) ? 'bg-dark-700 bg-opacity-50' : ''}
              ${getStatusColor(file.status)}
            `}
            onClick={() => toggleFileSelection(file.id)}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={activeSelectedFiles.includes(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Durum İkonu */}
              <div className="flex-shrink-0">
                {getStatusIcon(file.status)}
              </div>

              {/* Dosya Bilgileri */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-white truncate pr-4">
                    {file.name}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-dark-600 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="uppercase font-mono">{file.extension}</span>
                  <span>{formatFileSize(file.size)}</span>
                  {file.width > 0 && file.height > 0 && (
                    <span>{file.width} × {file.height}</span>
                  )}
                  {file.space && (
                    <span className="px-2 py-0.5 bg-dark-600 rounded">
                      {file.space.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* İlerleme Çubuğu */}
                {file.status === t('common.processing') && (
                  <div className="mt-2 w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Sonuç Bilgisi */}
                {file.status === t('common.completed') && file.result && (
                  <div className="mt-2 text-xs text-green-400">
                    {file.result.originalSize && file.result.newSize ? (
                      <>
                        ✓ {formatFileSize(file.result.originalSize)} → {formatFileSize(file.result.newSize)}
                        {file.result.originalSize !== file.result.newSize && (
                          <span className={`ml-2 ${
                            file.result.newSize < file.result.originalSize 
                              ? 'text-green-300' 
                              : 'text-yellow-400'
                          }`}>
                            ({formatFileSize(Math.abs(file.result.originalSize - file.result.newSize))} {
                              file.result.newSize < file.result.originalSize 
                                ? t('fileList.reduced') 
                                : t('fileList.increased')
                            })
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        ✓ {formatFileSize(file.result.newSize)} 
                        {file.result.compressionRatio && (
                          <span className="ml-2">
                            (%{file.result.compressionRatio} {t('fileList.saved')})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Hata Mesajı */}
                {file.status === t('common.error') && file.result && (
                  <div className="mt-2 text-xs text-red-400">
                    ✗ {file.result.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daha Fazla Göster Butonu */}
      {hasMore && (
        <div className="p-4 border-t border-dark-700 bg-dark-900">
          <button
            onClick={loadMore}
            className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group"
          >
            <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
            {t('fileList.loadMore')} ({Math.min(ITEMS_PER_PAGE, files.length - displayCount)} {t('fileList.moreFiles')})
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {t('fileList.remaining')}: {files.length - displayCount} {t('fileList.files')}
          </p>
        </div>
      )}
    </div>
  );
});

FileList.displayName = 'FileList';

export default FileList;
