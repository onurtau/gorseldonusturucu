import React, { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const FileUploadZone = React.memo(() => {
  const { addFiles, addNotification } = useAppStore();
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList);
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico'];
    
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      addNotification({
        type: 'error',
        title: t('fileUpload.invalidFile'),
        message: t('fileUpload.selectValidFiles')
      });
      return;
    }

    if (validFiles.length !== files.length) {
      addNotification({
        type: 'warning',
        title: t('fileUpload.someFilesSkipped'),
        message: t('fileUpload.invalidFilesSkipped', { count: files.length - validFiles.length })
      });
    }

    // Dosya bilgilerini hazırla
    const filesInfo = validFiles.map((file, index) => ({
      file: file, // Orijinal File object'i (preview için gerekli)
      path: file.path || '', // Web'de path olmayabilir
      name: file.name,
      size: file.size,
      extension: file.name.split('.').pop().toLowerCase(),
      // Metadata placeholder (Electron'da dolu gelir, web'de boş kalır)
      width: 0,
      height: 0,
      format: file.name.split('.').pop().toLowerCase()
    }));

    addFiles(filesInfo);
    
    addNotification({
      type: 'success',
      title: t('fileUpload.filesAdded'),
      message: t('fileUpload.filesAddedSuccess', { count: validFiles.length })
    });
  }, [addFiles, addNotification, t]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = async () => {
    if (window.electronAPI) {
      // Electron: API ile dosya seç
      try {
        const result = await window.electronAPI.openFiles();
        
        if (!result.canceled && result.files) {
          addFiles(result.files);
          addNotification({
            type: 'success',
            title: t('fileUpload.filesAdded'),
            message: t('fileUpload.filesAddedSuccess', { count: result.files.length })
          });
        }
      } catch (error) {
        console.error('Dosya seçme hatası:', error);
        addNotification({
          type: 'error',
          title: t('common.error'),
          message: t('fileUpload.fileSelectError')
        });
      }
    } else {
      // Web: Native file input kullan
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          handleFiles(files);
        }
      };
      input.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-5 transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-primary-500 bg-primary-500 bg-opacity-10 scale-[1.02]' 
          : 'border-dark-600 bg-dark-800 hover:border-primary-500 hover:bg-dark-700'
        }
      `}
    >
      <div className="text-center">
        {/* İkon */}
        <div className={`
          inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 transition-all
          ${isDragging 
            ? 'bg-primary-500 scale-110' 
            : 'bg-dark-700'
          }
        `}>
          {isDragging ? (
            <FileImage className="w-7 h-7 text-white" />
          ) : (
            <Upload className="w-7 h-7 text-gray-400" />
          )}
        </div>

        {/* Başlık ve Açıklama */}
        <h3 className="text-base font-semibold mb-1.5 text-white">
          {isDragging ? t('fileUpload.dragDrop') : t('fileUpload.dragDrop')}
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          {t('fileUpload.dragDrop')}
        </p>

        {/* Yükle Butonu */}
        <button
          onClick={handleFileSelect}
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-5 py-2 rounded-lg font-semibold transition-all btn-hover-scale inline-flex items-center gap-2 mb-4 text-sm"
        >
          <FileImage className="w-5 h-5" />
          {t('fileUpload.selectFiles')}
        </button>

        {/* Desteklenen Formatlar */}
        <div className="pt-4 border-t border-dark-700">
          <p className="text-xs text-gray-500 mb-2">{t('fileUpload.supportedFormats')}:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {['JPG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'SVG', 'ICO'].map((format) => (
              <span
                key={format}
                className="px-2 py-0.5 bg-dark-700 text-gray-300 rounded text-xs font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* İpucu */}
        <div className="mt-4 flex items-start gap-2 text-left bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300">
            <p className="font-semibold mb-1">{t('fileUpload.tipTitle')}</p>
            <p>{t('fileUpload.tipText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

FileUploadZone.displayName = 'FileUploadZone';

export default FileUploadZone;
