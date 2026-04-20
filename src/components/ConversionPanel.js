import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Settings2, Play, Folder, Zap, Palette, Type, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';
import ProcessingStatusBar from './ProcessingStatusBar';
import * as imageProcessor from '../services/imageProcessor';

// Throttle helper function (UI performansı için)
const throttle = (func, delay) => {
  let lastCall = 0;
  let timeoutId = null;
  
  return (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // Eğer delay süresi geçtiyse hemen çalıştır
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Değilse son çağrıyı beklet
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
};

const ConversionPanel = React.memo(() => {
  const { t } = useLanguage();
  const {
    conversionSettings,
    updateConversionSettings,
    files,
    selectedFiles,
    ui,
    updateFileStatus,
    license,
    incrementUsage,
    addNotification,
    setBatchProcessing,
    updateBatchProgress,
    updateStats,
    recordStatistic,
    resetCancelFlag,
    setPausedAtIndex,
    setTotalFilesInBatch,
    togglePause,
    cancelBatchProcessing
  } = useAppStore();

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFolder, setOutputFolder] = useState(null); // Resume için klasör yolu
  
  // Collapsible sections state
  const [isConversionSettingsOpen, setIsConversionSettingsOpen] = useState(true);
  const [isWatermarkOpen, setIsWatermarkOpen] = useState(false);
  
  // PNG + targetSize kontrolü (kayıpsız format ile boyut hedefi uyumsuz) - memoize et
  const isPngWithTargetSize = useMemo(() => 
    conversionSettings.outputFormat === 'png' && conversionSettings.targetSize > 0,
    [conversionSettings.outputFormat, conversionSettings.targetSize]
  );
  
  // Throttled progress update (200ms'de bir güncelle)
  const throttledProgressUpdate = useRef(
    throttle((current, total) => {
      updateBatchProgress(current, total);
    }, 200)
  ).current;

  const handleConvert = async () => {
    const isElectron = imageProcessor.isElectron;

    // Lisans kontrolü (sadece Electron için)
    if (!license.canUse && isElectron) {
      addNotification({
        type: 'warning',
        title: t('conversionPanel.notifications.limitReached'),
        message: t('conversionPanel.notifications.limitMessage')
      });
      return;
    }

    // Seçili dosyaları al
    const filesToConvert = activeFiles.filter(f => activeSelectedFiles.includes(f.id));

    if (filesToConvert.length === 0) {
      addNotification({
        type: 'warning',
        title: t('conversionPanel.notifications.noFilesSelected'),
        message: t('conversionPanel.notifications.noFilesMessage')
      });
      return;
    }

    // Çıktı formatı kontrolü
    if (!conversionSettings.outputFormat) {
      addNotification({
        type: 'warning',
        title: t('conversionPanel.notifications.noFormatSelected'),
        message: t('conversionPanel.notifications.noFormatMessage')
      });
      return;
    }

    setIsProcessing(true);
    setBatchProcessing(true);

    try {
      if (!isElectron) {
        // WEB VERSION - Simple implementation
        for (const fileObj of filesToConvert) {
          updateFileStatus(fileObj.id, t('common.processing'), 50);
          
          try {
            // Build options for all-in-one processing
            const options = {
              outputFormat: conversionSettings.outputFormat,
              quality: conversionSettings.quality,
              targetSize: conversionSettings.targetSize,
              convertColorSpace: conversionSettings.convertColorSpace,
              preserveMetadata: conversionSettings.preserveMetadata,
              watermark: conversionSettings.watermark
            };

            // Use all-in-one endpoint for combined operations
            const formData = new FormData();
            formData.append('file', fileObj.file);
            formData.append('options', JSON.stringify(options));

            const response = await fetch(`${imageProcessor.API_BASE_URL}/api/all-in-one`, {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Processing failed');
            }

            const blob = await response.blob();
            const newFilename = fileObj.name.replace(/\.[^.]+$/, `.${conversionSettings.outputFormat}`);
            imageProcessor.downloadFile(blob, newFilename);
            
            updateFileStatus(fileObj.id, t('common.completed'), 100);
            
            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} ${t('conversionPanel.notifications.successMessage')}`
            });
          } catch (error) {
            updateFileStatus(fileObj.id, t('common.error'), 0, { error: error.message });
            addNotification({
              type: 'error',
              title: t('notifications.error'),
              message: error.message
            });
          }
        }
        
        setIsProcessing(false);
        setBatchProcessing(false);
        return;
      }

      // ELECTRON VERSION
      // Tek dosya mı, toplu mu?
      if (filesToConvert.length === 1) {
        // Tek dosya dönüştürme
        const file = filesToConvert[0];
        
        // Dosya adından mevcut uzantıyı çıkar ve yeni uzantıyı ekle
        const baseFileName = file.name.replace(/\.[^.]+$/, '');
        const defaultFileName = `${baseFileName}.${conversionSettings.outputFormat}`;
        
        // Kaydetme yeri seç
        const saveResult = await window.electronAPI.saveFile(
          defaultFileName
        );

        if (saveResult.canceled) {
          setIsProcessing(false);
          setBatchProcessing(false);
          return;
        }

        // Dosya yolunu kontrol et ve doğru uzantıyı garanti et
        let outputPath = saveResult.filePath;
        const currentExt = outputPath.split('.').pop().toLowerCase();
        
        // Eğer uzantı seçilen format ile uyuşmuyorsa düzelt
        if (currentExt !== conversionSettings.outputFormat) {
          outputPath = outputPath.replace(/\.[^.]+$/, '') + `.${conversionSettings.outputFormat}`;
        }

        updateFileStatus(file.id, 'işleniyor', 50);

        const result = await window.electronAPI.convertImage({
          inputPath: file.path,
          outputPath: outputPath,
          outputFormat: conversionSettings.outputFormat,
          quality: conversionSettings.quality,
          targetSize: conversionSettings.targetSize,
          convertColorSpace: conversionSettings.convertColorSpace,
          preserveMetadata: conversionSettings.preserveMetadata,
          watermark: conversionSettings.watermark
        });

        if (result.success) {
          updateFileStatus(file.id, 'tamamlandı', 100, result);
          await window.electronAPI.incrementUsage();
          incrementUsage();
          
          // İstatistikleri güncelle
          updateStats({
            sizeSaved: (result.originalSize && result.newSize) 
              ? result.originalSize - result.newSize 
              : 0,
            compressionRatio: parseFloat(result.compressionRatio) || 0
          });
          
          // Detaylı istatistik kaydı
          const originalExt = file.name.split('.').pop().toLowerCase();
          
          // Format dönüştürme var mı?
          if (originalExt !== conversionSettings.outputFormat) {
            recordStatistic('format-conversion', {
              formatConversions: [{ from: originalExt, to: conversionSettings.outputFormat, count: 1 }],
              originalTotalSize: result.originalSize,
              newTotalSize: result.newSize,
              fileCount: 1
            });
          }
          
          // Boyut hedefi var mı?
          if (conversionSettings.targetSize) {
            recordStatistic('resize', {
              resizeType: 'targetSize',
              fileCount: 1,
              originalTotalSize: result.originalSize,
              newTotalSize: result.newSize
            });
          }
          
          // Renk uzayı dönüşümü var mı?
          if (conversionSettings.convertColorSpace) {
            recordStatistic('colorspace', {
              fromColorSpace: result.colorSpace || 'srgb',
              toColorSpace: conversionSettings.convertColorSpace,
              fileCount: 1
            });
          }
          
          // Filigran var mı?
          if (conversionSettings.watermark?.enabled && conversionSettings.watermark?.text) {
            recordStatistic('watermark', {
              fileCount: 1,
              watermarkType: conversionSettings.watermark.tileEnabled ? 'tile' : 'text'
            });
          }

          addNotification({
            type: 'success',
            title: t('conversionPanel.notifications.conversionSuccess'),
            message: `${file.name} ${t('conversionPanel.notifications.successMessage')}`
          });
        } else {
          updateFileStatus(file.id, t('common.error'), 0, { error: result.error });
          addNotification({
            type: 'error',
            title: t('conversionPanel.notifications.error'),
            message: result.error
          });
        }
      } else {
        // Toplu dönüştürme
        // Resume kontrolü: pausedAtIndex > 0 ise devam eden bir işlem var
        const isResuming = ui.pausedAtIndex > 0 && outputFolder;
        
        let selectedOutputFolder = outputFolder;
        
        if (!isResuming) {
          // Yeni işlem: Klasör seç
          const folderResult = await window.electronAPI.selectFolder();

          if (folderResult.canceled) {
            setIsProcessing(false);
            setBatchProcessing(false);
            return;
          }

          selectedOutputFolder = folderResult.filePaths[0];
          setOutputFolder(selectedOutputFolder);
          
          // İşlem bilgilerini kaydet
          setTotalFilesInBatch(filesToConvert.length);
          setPausedAtIndex(0);
        }
        
        // Cancel ve pause flag'lerini sıfırla (sadece yeni işlemde)
        if (!isResuming) {
          resetCancelFlag();
        }
        
        // İlerleme başlat (resume ise kaldığı yerden)
        const startIndex = isResuming ? ui.pausedAtIndex : 0;
        updateBatchProgress(startIndex, filesToConvert.length);

        // Chunk Processing: Dosyaları 20'şer gruplara böl
        const CHUNK_SIZE = 20;
        const chunks = [];
        for (let i = 0; i < filesToConvert.length; i += CHUNK_SIZE) {
          chunks.push(filesToConvert.slice(i, i + CHUNK_SIZE));
        }

        let processedCount = isResuming ? startIndex : 0;
        let cancelledByUser = false;
        let pausedByUser = false;
        let renamedCount = 0; // Numaralandırılan dosya sayısı
        
        // İstatistik toplama değişkenleri
        let successfulFiles = [];
        let totalOriginalSize = 0;
        let totalNewSize = 0;
        const formatConversionsMap = {}; // { 'png->jpg': count }
        
        // Resume ise kaldığı chunk'tan başla
        const startChunkIndex = Math.floor(processedCount / CHUNK_SIZE);

        for (let chunkIndex = startChunkIndex; chunkIndex < chunks.length; chunkIndex++) {
          // Pause kontrolü (chunk başında) - Store'dan direkt oku!
          if (useAppStore.getState().ui.isPaused) {
            pausedByUser = true;
            break;
          }
          
          // Cancel kontrolü (chunk başında) - Store'dan direkt oku!
          if (useAppStore.getState().ui.isCancelling) {
            cancelledByUser = true;
            break;
          }

          const chunk = chunks[chunkIndex];
          
          // Resume ise, chunk içinde kaldığı dosyadan başla
          const startFileIndex = (chunkIndex === startChunkIndex && isResuming) 
            ? processedCount % CHUNK_SIZE 
            : 0;

          for (let i = startFileIndex; i < chunk.length; i++) {
            // Pause kontrolü (her dosya öncesi) - Store'dan direkt oku!
            if (useAppStore.getState().ui.isPaused) {
              pausedByUser = true;
              break;
            }
            
            // Cancel kontrolü (her dosya öncesi) - Store'dan direkt oku!
            if (useAppStore.getState().ui.isCancelling) {
              cancelledByUser = true;
              break;
            }

            const file = chunk[i];
            updateFileStatus(file.id, 'işleniyor', 50);

            // Dosya adını belirle
            const outputFileName = file.name.replace(/\.[^.]+$/, '');
            const outputPath = `${selectedOutputFolder}\\${outputFileName}.${conversionSettings.outputFormat}`;

            const result = await window.electronAPI.convertImage({
              inputPath: file.path,
              outputPath: outputPath,
              outputFormat: conversionSettings.outputFormat,
              quality: conversionSettings.quality,
              targetSize: conversionSettings.targetSize,
              convertColorSpace: conversionSettings.convertColorSpace,
              preserveMetadata: conversionSettings.preserveMetadata,
              watermark: conversionSettings.watermark
            });

            if (result.success) {
              // Numaralandırma kontrolü
              if (result.wasRenamed) {
                renamedCount++;
              }
              
              updateFileStatus(file.id, 'tamamlandı', 100, result);
              await window.electronAPI.incrementUsage();
              incrementUsage();
              
              updateStats({
                sizeSaved: (result.originalSize && result.newSize) 
                  ? result.originalSize - result.newSize 
                  : 0,
                compressionRatio: parseFloat(result.compressionRatio) || 0
              });
              
              // İstatistik topla
              successfulFiles.push(file);
              totalOriginalSize += result.originalSize || 0;
              totalNewSize += result.newSize || 0;
              
              // Format dönüştürme var mı?
              const originalExt = file.name.split('.').pop().toLowerCase();
              if (originalExt !== conversionSettings.outputFormat) {
                const conversionKey = `${originalExt}->${conversionSettings.outputFormat}`;
                formatConversionsMap[conversionKey] = (formatConversionsMap[conversionKey] || 0) + 1;
              }
            } else {
              updateFileStatus(file.id, t('common.error'), 0, { error: result.error });
            }
            
            processedCount++;
            // İlerleme ve pause index güncelle
            updateBatchProgress(processedCount, filesToConvert.length);
            setPausedAtIndex(processedCount);
          }

          // Pause kontrolü (chunk sonrası)
          if (pausedByUser) {
            break;
          }
          
          // Cancel kontrolü (chunk sonrası)
          if (cancelledByUser) {
            break;
          }

          // Chunk arası bekleme (son chunk değilse)
          if (chunkIndex < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (pausedByUser) {
          // Pause durumunda state'i koru (setBatchProcessing false yapma!)
          addNotification({
            type: 'info',
            title: t('conversionPanel.notifications.paused'),
            message: t('conversionPanel.notifications.pausedMessage')
          });
          
          // isProcessing'i false yap ki kullanıcı resume edebilsin
          setIsProcessing(false);
          return; // finally bloğuna gitme
        }
        
        if (cancelledByUser) {
          resetCancelFlag();
          setOutputFolder(null); // Klasör seçimini sıfırla
          setPausedAtIndex(0);
          setTotalFilesInBatch(0);
          addNotification({
            type: 'warning',
            title: t('conversionPanel.notifications.cancelled'),
            message: `${processedCount} / ${filesToConvert.length} ${t('conversionPanel.notifications.cancelledMessage')}`
          });
          
          // Numaralandırma bildirimi
          if (renamedCount > 0) {
            addNotification({
              type: 'info',
              title: t('notifications.fileNameConflict'),
              message: t('batchProcessing.filesDuplicated', { count: renamedCount })
            });
          }
        } else {
          // Başarıyla tamamlandı
          setOutputFolder(null); // Klasör seçimini sıfırla
          setPausedAtIndex(0);
          setTotalFilesInBatch(0);
          
          // Detaylı istatistik kaydı (başarılı işlemler varsa)
          if (successfulFiles.length > 0) {
            // Format dönüştürme istatistiği
            if (Object.keys(formatConversionsMap).length > 0) {
              const formatConversions = Object.entries(formatConversionsMap).map(([key, count]) => {
                const [from, to] = key.split('->');
                return { from, to, count };
              });
              
              recordStatistic('format-conversion', {
                formatConversions,
                originalTotalSize: totalOriginalSize,
                newTotalSize: totalNewSize,
                fileCount: successfulFiles.length
              });
            }
            
            // Boyut hedefi istatistiği
            if (conversionSettings.targetSize) {
              recordStatistic('resize', {
                resizeType: 'targetSize',
                fileCount: successfulFiles.length,
                originalTotalSize: totalOriginalSize,
                newTotalSize: totalNewSize
              });
            }
            
            // Renk uzayı dönüşümü istatistiği
            if (conversionSettings.convertColorSpace) {
              recordStatistic('colorspace', {
                fromColorSpace: 'srgb',
                toColorSpace: conversionSettings.convertColorSpace,
                fileCount: successfulFiles.length
              });
            }
            
            // Filigran istatistiği
            if (conversionSettings.watermark?.enabled && conversionSettings.watermark?.text) {
              recordStatistic('watermark', {
                fileCount: successfulFiles.length,
                watermarkType: conversionSettings.watermark.tileEnabled ? 'tile' : 'text'
              });
            }
          }
          
          addNotification({
            type: 'success',
            title: t('conversionPanel.notifications.bulkConversionComplete'),
            message: `${filesToConvert.length} ${t('conversionPanel.notifications.bulkSuccessMessage')}`
          });
          
          // Numaralandırma bildirimi
          if (renamedCount > 0) {
            addNotification({
              type: 'info',
              title: t('notifications.fileNameConflict'),
              message: t('batchProcessing.filesDuplicated', { count: renamedCount })
            });
          }
        }
      }
    } catch (error) {
      console.error('Dönüştürme hatası:', error);
      addNotification({
        type: 'error',
        title: t('conversionPanel.notifications.error'),
        message: error.message || 'An error occurred during conversion'
      });
    } finally {
      setIsProcessing(false);
      // Pause durumunda setBatchProcessing(false) yapma (butonlar kaybolmasın)
      if (!useAppStore.getState().ui.isPaused) {
        setBatchProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* İşlem Durum Çubuğu - Pause/Resume/Cancel */}
      <ProcessingStatusBar onResume={handleConvert} />

      {/* 1. Dönüşüm Ayarları Bloğu - Collapsible */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        {/* Başlık - Tıklanabilir */}
        <button
          onClick={() => setIsConversionSettingsOpen(!isConversionSettingsOpen)}
          className="w-full p-2 sm:p-4 border-b border-dark-700 flex items-center justify-between hover:bg-dark-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">{t('conversionPanel.title')}</h3>
          </div>
          {isConversionSettingsOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* İçerik */}
        {isConversionSettingsOpen && (
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
            {/* Çıktı Formatı */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('conversionPanel.outputFormat')}
              </label>
              <select
                value={conversionSettings.outputFormat}
                onChange={(e) => updateConversionSettings({ outputFormat: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="jpg">{t('conversionPanel.formats.jpeg')}</option>
                <option value="png">{t('conversionPanel.formats.png')}</option>
                <option value="webp">{t('conversionPanel.formats.webp')}</option>
                <option value="avif">{t('conversionPanel.formats.avif')}</option>
                <option value="tiff">{t('conversionPanel.formats.tiff')}</option>
              </select>
            </div>

            {/* Kalite */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('conversionPanel.quality')}: {conversionSettings.quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={conversionSettings.quality}
                onChange={(e) => updateConversionSettings({ quality: parseInt(e.target.value) })}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Hedef Dosya Boyutu */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {t('conversionPanel.targetFileSize')}
              </label>
              <input
                type="number"
                placeholder={t('conversionPanel.fontSizePlaceholder')}
                value={conversionSettings.targetSize || ''}
                onChange={(e) => updateConversionSettings({ 
                  targetSize: e.target.value ? parseInt(e.target.value) : null 
                })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('conversionPanel.targetFileSizeHint')}
              </p>
            </div>

            {/* Renk Uzayı Dönüşümü */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {t('colorSpace.title')}
              </label>
              <select
                value={conversionSettings.convertColorSpace || ''}
                onChange={(e) => updateConversionSettings({ 
                  convertColorSpace: e.target.value || null 
                })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('conversionPanel.colorSpaceOptions.dontConvert')}</option>
                <option value="rgb">{t('conversionPanel.colorSpaceOptions.toRgb')}</option>
                <option value="cmyk">{t('conversionPanel.colorSpaceOptions.toCmyk')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('conversionPanel.cmykInfo')}
              </p>
            </div>

            {/* Metadata Koruma */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-300">{t('conversionPanel.preserveMetadata')}</p>
                <p className="text-xs text-gray-500">{t('conversionPanel.metadataInfo')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={conversionSettings.preserveMetadata}
                  onChange={(e) => updateConversionSettings({ 
                    preserveMetadata: e.target.checked 
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 2. Watermark (Filigran) Bloğu - Collapsible */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        {/* Başlık - Tıklanabilir */}
        <button
          onClick={() => setIsWatermarkOpen(!isWatermarkOpen)}
          className="w-full p-4 border-b border-dark-700 flex items-center justify-between hover:bg-dark-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">{t('conversionPanel.watermarkTitle')}</h3>
          </div>
          <div className="flex items-center gap-2">
            {conversionSettings.watermark.enabled && (
              <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded font-medium">
                {t('common.active')}
              </span>
            )}
            {isWatermarkOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* İçerik */}
        {isWatermarkOpen && (
          <div className="p-4 space-y-4">
            {/* Watermark Aktif/Pasif Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-300">{t('conversionPanel.addWatermark')}</p>
                <p className="text-xs text-gray-500">{t('conversionPanel.addWatermarkDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={conversionSettings.watermark.enabled}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      enabled: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {conversionSettings.watermark.enabled && (
            <div className="space-y-3 p-3 bg-dark-700/50 rounded-lg">
              {/* Watermark Metni */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.watermarkText')}
                </label>
                <input
                  type="text"
                  placeholder={t('conversionPanel.watermarkPlaceholder')}
                  value={conversionSettings.watermark.text}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      text: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Pozisyon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.position')}
                </label>
                <select
                  value={conversionSettings.watermark.position}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      position: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="top-left">{t('conversionPanel.positions.topLeft')}</option>
                  <option value="top-right">{t('conversionPanel.positions.topRight')}</option>
                  <option value="bottom-left">{t('conversionPanel.positions.bottomLeft')}</option>
                  <option value="bottom-right">{t('conversionPanel.positions.bottomRight')}</option>
                  <option value="center">{t('conversionPanel.positions.center')}</option>
                </select>
              </div>

              {/* Opaklık */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.opacity')}: {Math.round(conversionSettings.watermark.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={conversionSettings.watermark.opacity}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      opacity: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Yazı Boyutu (Yüzde Bazlı) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.fontSize')}: %{conversionSettings.watermark.fontSizePercent}
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={conversionSettings.watermark.fontSizePercent}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      fontSizePercent: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{t('conversionPanel.fontSizeSmall')}</span>
                  <span>{t('conversionPanel.fontSizeMedium')}</span>
                  <span>{t('conversionPanel.fontSizeLarge')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 {t('conversionPanel.autoScaleHint')}
                </p>
              </div>

              {/* Font Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.fontFamily')}
                </label>
                <select
                  value={conversionSettings.watermark.fontFamily}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      fontFamily: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Arial Black">Arial Black</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Impact">Impact</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Palatino">Palatino</option>
                  <option value="Garamond">Garamond</option>
                  <option value="Bookman">Bookman</option>
                  <option value="Avant Garde">Avant Garde</option>
                  <option value="Candara">Candara</option>
                  <option value="Segoe UI">Segoe UI</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              {/* Yazı Rengi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('conversionPanel.textColor')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: t('conversionPanel.colors.gray'), value: '#808080' },
                    { name: t('conversionPanel.colors.white'), value: '#FFFFFF' },
                    { name: t('conversionPanel.colors.black'), value: '#000000' },
                    { name: t('conversionPanel.colors.red'), value: '#FF0000' }
                  ].map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => updateConversionSettings({ 
                        watermark: {
                          ...conversionSettings.watermark,
                          color: colorOption.value
                        }
                      })}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-medium transition-all
                        ${
                          conversionSettings.watermark.color === colorOption.value
                            ? 'bg-primary-500 text-white ring-2 ring-primary-400'
                            : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                        }
                      `}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-500" 
                          style={{ backgroundColor: colorOption.value }}
                        ></div>
                        {colorOption.name}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 {t('conversionPanel.grayColorTip')}
                </p>
              </div>

              {/* Gölgelendirme */}
              <div>
                <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{t('conversionPanel.shadow')}</p>
                    <p className="text-xs text-gray-500">{t('conversionPanel.shadowHint')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conversionSettings.watermark.shadow}
                      onChange={(e) => updateConversionSettings({ 
                        watermark: {
                          ...conversionSettings.watermark,
                          shadow: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 {t('conversionPanel.shadowTip')}
                </p>
              </div>

              {/* Döşeme Modu */}
              <div>
                <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{t('conversionPanel.tileMode')}</p>
                    <p className="text-xs text-gray-500">{t('conversionPanel.tileModeDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conversionSettings.watermark.tileEnabled}
                      onChange={(e) => updateConversionSettings({ 
                        watermark: {
                          ...conversionSettings.watermark,
                          tileEnabled: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {/* Döşeme Pattern Seçenekleri */}
                {conversionSettings.watermark.tileEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: t('tilePatterns.diagonal'), value: 'diagonal', icon: '↘️' },
                      { name: t('tilePatterns.diagonalReverse'), value: 'diagonal-reverse', icon: '↗️' },
                      { name: t('tilePatterns.grid'), value: 'grid', icon: '⊞' },
                      { name: t('tilePatterns.dense'), value: 'dense', icon: '▦' }
                    ].map((pattern) => (
                      <button
                        key={pattern.value}
                        onClick={() => updateConversionSettings({ 
                          watermark: {
                            ...conversionSettings.watermark,
                            tilePattern: pattern.value
                          }
                        })}
                        className={`
                          px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                          ${
                            conversionSettings.watermark.tilePattern === pattern.value
                              ? 'bg-primary-500 text-white ring-2 ring-primary-400'
                              : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                          }
                        `}
                      >
                        <span>{pattern.icon}</span>
                        {pattern.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* 3. Dönüştür Butonu - Ana Buton */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden p-4">
        {/* PNG + targetSize Uyarısı */}
        {isPngWithTargetSize && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-500 mb-1">
                  {t('conversionPanel.pngTargetSizeWarningTitle') || 'PNG + Hedef Boyut Uyarısı'}
                </p>
                <p className="text-xs text-yellow-400/80">
                  {t('conversionPanel.pngTargetSizeWarning') || 'PNG kayıpsız bir formattır ve hedef dosya boyutu özelliği ile uyumlu değildir. Dosya boyutu hedeflenen değere düşmeyebilir, hatta artabilir. Boyut küçültme için lütfen JPEG, WebP veya AVIF formatlarını tercih edin.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleConvert}
          disabled={isProcessing || activeSelectedFiles.length === 0 || (!license.canUse && imageProcessor.isElectron) || isPngWithTargetSize}
          className={`
            w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
            ${isProcessing || activeSelectedFiles.length === 0 || (!license.canUse && imageProcessor.isElectron) || isPngWithTargetSize
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white btn-hover-scale'
            }
          `}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              {t('conversionPanel.processing')}
            </>
          ) : (
            <>
              {activeSelectedFiles.length > 1 ? <Folder className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {activeSelectedFiles.length > 1 
                ? t('conversionPanel.bulkConvert').replace('{count}', activeSelectedFiles.length)
                : `▶️ ${t('conversionPanel.convert')}`
              }
            </>
          )}
        </button>
      </div>
    </div>
  );
});

ConversionPanel.displayName = 'ConversionPanel';

export default ConversionPanel;
