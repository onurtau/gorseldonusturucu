import React, { useState, useEffect } from 'react';
import { Droplet, ArrowRight } from 'lucide-react';
import WatermarkPreview from '../components/WatermarkPreview';
import FileUploadZone from '../components/FileUploadZone';
import FileList from '../components/FileList';
import ProcessingStatusBar from '../components/ProcessingStatusBar';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';
import * as imageProcessor from '../services/imageProcessor';

const WatermarkPage = ({ onBackToLanding }) => {
  const { t } = useLanguage();
  const {
    files,
    selectedFiles,
    ui,
    setActiveView,
    conversionSettings,
    updateConversionSettings,
    updateFileStatus,
    removeFile,
    license,
    incrementUsage,
    addNotification,
    setBatchProcessing,
    updateBatchProgress,
    updateStats,
    recordStatistic,
    resetCancelFlag,
    setTotalFilesInBatch,
    setPausedAtIndex
  } = useAppStore();

  // Set active view on mount
  useEffect(() => {
    setActiveView('watermark');
  }, [setActiveView]);

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFolder, setOutputFolder] = useState(null); // Resume için klasör yolu

  const handleConvert = async () => {
    const isElectron = imageProcessor.isElectron;

    if (!license.canUse && isElectron) {
      addNotification({
        type: 'warning',
        title: t('notifications.limitReached'),
        message: t('notifications.needPremium')
      });
      return;
    }

    const filesToConvert = activeFiles.filter(f => activeSelectedFiles.includes(f.id));

    if (filesToConvert.length === 0) {
      addNotification({
        type: 'warning',
        title: t('notifications.noFileSelected'),
        message: t('notifications.pleaseSelectFile')
      });
      return;
    }

    if (!conversionSettings.watermark.text) {
      addNotification({
        type: 'warning',
        title: t('watermark.textMissing'),
        message: t('watermark.pleaseEnterText')
      });
      return;
    }

    setIsProcessing(true);
    setBatchProcessing(true);

    try {
      // Filigran'ı aktif yap
      const watermarkSettings = {
        ...conversionSettings.watermark,
        enabled: true
      };

      if (!isElectron) {
        // WEB VERSION - Simple implementation
        for (const fileObj of filesToConvert) {
          updateFileStatus(fileObj.id, t('common.processing'), 50);
          
          try {
            const blob = await imageProcessor.addWatermark(fileObj.file, watermarkSettings);

            imageProcessor.downloadFile(blob, fileObj.name);
            updateFileStatus(fileObj.id, t('common.completed'), 100);
            
            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} ${t('watermark.applied')}`
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

      // ELECTRON VERSION (original code continues...)
      if (filesToConvert.length === 1) {
        const file = filesToConvert[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Orijinal format için filtre
        const formatFilters = [
          { name: `${fileExtension.toUpperCase()} Dosyası`, extensions: [fileExtension] }
        ];
        
        const saveResult = await window.electronAPI.saveFile(
          file.name,
          formatFilters
        );

        if (saveResult.canceled) {
          setIsProcessing(false);
          setBatchProcessing(false);
          return;
        }

        updateFileStatus(file.id, t('common.processing'), 50);

        const result = await window.electronAPI.convertImage({
          inputPath: file.path,
          outputPath: saveResult.filePath,
          outputFormat: file.name.split('.').pop(),
          quality: 95,
          watermark: watermarkSettings,
          preserveMetadata: true
        });

        if (result.success) {
          updateFileStatus(file.id, t('common.completed'), 100, result);
          await window.electronAPI.incrementUsage();
          incrementUsage();
          
          updateStats({
            sizeSaved: result.originalSize - result.newSize,
            compressionRatio: parseFloat(result.compressionRatio) || 0
          });
          
          // İstatistik kaydı
          recordStatistic('watermark', {
            fileCount: 1,
            watermarkType: watermarkSettings.tileEnabled ? 'tile' : 'text'
          });

          addNotification({
            type: 'success',
            title: t('notifications.success'),
            message: `${file.name} ${t('watermark.added')}.`
          });
        } else {
          updateFileStatus(file.id, t('common.error'), 0, { error: result.error });
          addNotification({
            type: 'error',
            title: t('notifications.error'),
            message: result.error
          });
        }
      } else {
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
            updateFileStatus(file.id, t('common.processing'), 50);

            const outputPath = `${selectedOutputFolder}/${file.name}`;

            const result = await window.electronAPI.convertImage({
              inputPath: file.path,
              outputPath: outputPath,
              outputFormat: file.name.split('.').pop(),
              quality: 95,
              watermark: watermarkSettings,
              preserveMetadata: true
            });

            if (result.success) {
              // Numaralandırma kontrolü
              if (result.wasRenamed) {
                renamedCount++;
              }
              
              updateFileStatus(file.id, t('common.completed'), 100, result);
              await window.electronAPI.incrementUsage();
              incrementUsage();
              
              updateStats({
                sizeSaved: result.originalSize - result.newSize,
                compressionRatio: parseFloat(result.compressionRatio) || 0
              });
              
              // İstatistik topla
              successfulFiles.push(file);
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
            title: t('batchProcessing.paused'),
            message: t('batchProcessing.pausedMessage')
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
            title: t('batchProcessing.cancelled'),
            message: t('batchProcessing.cancelledMessage', { count: processedCount })
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
          // İşlem başarıyla tamamlandı - State'i sıfırla
          setOutputFolder(null);
          setPausedAtIndex(0);
          setTotalFilesInBatch(0);
          
          // İstatistik kaydı (başarılı işlemler varsa)
          if (successfulFiles.length > 0) {
            recordStatistic('watermark', {
              fileCount: successfulFiles.length,
              watermarkType: watermarkSettings.tileEnabled ? 'tile' : 'text'
            });
          }
          
          addNotification({
            type: 'success',
            title: t('notifications.completed'),
            message: `${filesToConvert.length} ${t('watermark.filesProcessed')}.`
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
      addNotification({
        type: 'error',
        title: t('notifications.error'),
        message: error.message
      });
    } finally {
      setIsProcessing(false);
      // Pause değilse setBatchProcessing(false) yap
      if (!useAppStore.getState().ui.isPaused) {
        setBatchProcessing(false);
      }
    }
  };

  return (
    <main className="container mx-auto px-4 py-4 max-w-6xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Droplet className="w-7 h-7 text-orange-400" />
          {t('watermark.title')}
        </h2>
        <p className="text-gray-400">{t('watermark.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sol Panel - Önizleme (3/4 genişlik) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Önizleme */}
          <WatermarkPreview />

          {/* İşlem Durum Çubuğu */}
          <ProcessingStatusBar onResume={handleConvert} />

          {/* Dosya Yükleme */}
          <FileUploadZone />

          {/* Dosya Listesi */}
          <FileList files={files} onRemove={removeFile} />

          {/* Dönüştür Butonu */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse) || !conversionSettings.watermark.text}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-base
                ${isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse) || !conversionSettings.watermark.text
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:scale-105'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('common.processing')}...
                </>
              ) : (
                <>
                  {t('watermark.addButton')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sağ Panel - Filigran Ayarları */}
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            <h3 className="text-base font-semibold text-white mb-3">{t('watermark.settings')}</h3>

            <div className="space-y-3">
              {/* Metin */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.text')}
                </label>
                <input
                  type="text"
                  placeholder={t('watermark.textPlaceholder')}
                  value={conversionSettings.watermark.text}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      text: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Pozisyon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.position')}
                </label>
                <select
                  value={conversionSettings.watermark.position}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      position: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="top-left">{t('watermark.topLeft')}</option>
                  <option value="top-right">{t('watermark.topRight')}</option>
                  <option value="bottom-left">{t('watermark.bottomLeft')}</option>
                  <option value="bottom-right">{t('watermark.bottomRight')}</option>
                  <option value="center">{t('watermark.center')}</option>
                </select>
              </div>

              {/* Şeffaflık */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.opacity')}: {Math.round(conversionSettings.watermark.opacity * 100)}%
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
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Yazı Boyutu */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.fontSize')}: %{conversionSettings.watermark.fontSizePercent}
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
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('watermark.autoScale')}
                </p>
              </div>

              {/* Font Ailesi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.fontFamily')}
                </label>
                <select
                  value={conversionSettings.watermark.fontFamily}
                  onChange={(e) => updateConversionSettings({ 
                    watermark: {
                      ...conversionSettings.watermark,
                      fontFamily: e.target.value
                    }
                  })}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Impact">Impact</option>
                  <option value="Arial Black">Arial Black</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Bebas Neue">Bebas Neue</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Anton">Anton</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>

              {/* Renk */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('watermark.color')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: t('watermark.gray'), value: '#808080' },
                    { name: t('watermark.white'), value: '#FFFFFF' },
                    { name: t('watermark.black'), value: '#000000' },
                    { name: t('watermark.red'), value: '#FF0000' }
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
                        px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                        ${
                          conversionSettings.watermark.color === colorOption.value
                            ? 'bg-orange-500 text-white ring-2 ring-orange-400'
                            : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                        }
                      `}
                    >
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-500" 
                        style={{ backgroundColor: colorOption.value }}
                      ></div>
                      {colorOption.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gölgelendirme */}
              <div>
                <div className="flex items-center justify-between p-2.5 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{t('watermark.shadow')}</p>
                    <p className="text-xs text-gray-500">{t('watermark.shadowDesc')}</p>
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
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              {/* Döşeme Modu */}
              <div>
                <div className="flex items-center justify-between p-2.5 bg-dark-700 rounded-lg mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{t('watermark.tileMode')}</p>
                    <p className="text-xs text-gray-500">{t('watermark.tileModeDesc')}</p>
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
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Döşeme Pattern Seçenekleri - Sadece döşeme aktifse göster */}
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
                              ? 'bg-orange-500 text-white ring-2 ring-orange-400'
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
          </div>
        </div>
      </div>
    </main>
  );
};

export default WatermarkPage;
