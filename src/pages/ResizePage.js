import React, { useState, useEffect } from 'react';
import { Minimize2, ArrowRight } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import FileList from '../components/FileList';
import ProcessingStatusBar from '../components/ProcessingStatusBar';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';import * as imageProcessor from '../services/imageProcessor';
const ResizePage = ({ onBackToLanding }) => {
  const { t } = useLanguage();
  const {
    files,
    selectedFiles,
    ui,
    setActiveView,
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
    setActiveView('resize');
  }, [setActiveView]);

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  const [quality, setQuality] = useState(85);
  const [targetSize, setTargetSize] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFolder, setOutputFolder] = useState(null); // Resume için klasör yolu
  
  // PNG dosyaları kontrolü
  const filesToConvert = activeFiles.filter(f => activeSelectedFiles.includes(f.id));
  const hasPngFiles = filesToConvert.some(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    return ext === 'png';
  });
  const isPngWithTargetSize = hasPngFiles && targetSize > 0;

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

    setIsProcessing(true);
    setBatchProcessing(true);

    try {
      if (!isElectron) {
        // WEB VERSION - Simple implementation
        for (const fileObj of filesToConvert) {
          updateFileStatus(fileObj.id, t('common.processing'), 50);
          
          try {
            const blob = await imageProcessor.resizeImage(fileObj.file, {
              quality: quality,
              targetSize: targetSize ? parseInt(targetSize) : null
            });

            imageProcessor.downloadFile(blob, fileObj.name);
            updateFileStatus(fileObj.id, t('common.completed'), 100);
            
            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} ${t('resize.optimized')}`
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
          quality: quality,
          targetSize: targetSize ? parseInt(targetSize) : null,
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
          recordStatistic('resize', {
            resizeType: targetSize ? 'targetSize' : 'optimize',
            fileCount: 1,
            originalTotalSize: result.originalSize,
            newTotalSize: result.newSize
          });

          const ratio = parseFloat(result.compressionRatio);
          const isReduced = ratio >= 0;
          const message = isReduced 
            ? `${file.name} ${t('resize.optimized')}. ${Math.abs(ratio).toFixed(0)}% ${t('resize.reduced')}.`
            : `${file.name} ${t('resize.optimized')}. ${Math.abs(ratio).toFixed(0)}% ${t('notifications.increased')}.`;

          addNotification({
            type: 'success',
            title: t('notifications.success'),
            message: message
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
        let totalOriginalSize = 0;
        let totalNewSize = 0;
        
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
              quality: quality,
              targetSize: targetSize ? parseInt(targetSize) : null,
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
              totalOriginalSize += result.originalSize;
              totalNewSize += result.newSize;
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
            recordStatistic('resize', {
              resizeType: targetSize ? 'targetSize' : 'optimize',
              fileCount: successfulFiles.length,
              originalTotalSize: totalOriginalSize,
              newTotalSize: totalNewSize
            });
          }
          
          addNotification({
            type: 'success',
            title: t('notifications.completed'),
            message: `${filesToConvert.length} ${t('resize.filesOptimized')}.`
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
    <main className="container mx-auto px-4 py-4 max-w-5xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Minimize2 className="w-7 h-7 text-green-400" />
          {t('resize.title')}
        </h2>
        <p className="text-gray-400">{t('resize.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {/* Ayarlar */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <h3 className="text-base font-semibold text-white mb-3">{t('resize.optimizationSettings')}</h3>
          
          <div className="space-y-4">
            {/* Kalite */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('resize.quality')}: {quality}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-3 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{t('resize.lowQuality')}</span>
                <span>{t('resize.highQuality')}</span>
              </div>
            </div>

            {/* Hedef Boyut */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('resize.targetSize')}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder={t('resize.example')}
                  value={targetSize}
                  onChange={(e) => setTargetSize(e.target.value)}
                  className="flex-1 bg-dark-600 border border-dark-500 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-gray-400 font-medium">KB</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 {t('resize.targetSizeHint')}
              </p>
            </div>

            {/* Bilgi */}
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-xs font-semibold text-green-300 mb-1.5">{t('resize.howItWorks')}</h4>
              <ul className="text-xs text-green-200 space-y-0.5">
                <li>• {t('resize.howItWorksItem1')}</li>
                <li>• {t('resize.howItWorksItem2')}</li>
                <li>• {t('resize.howItWorksItem3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* İşlem Durum Çubuğu */}
        <ProcessingStatusBar onResume={handleConvert} />

        {/* Dosya Yükleme */}
        <FileUploadZone />

        {/* Dosya Listesi */}
        <FileList files={files} onRemove={removeFile} />

        {/* Dönüştür Butonu */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-3">
          {/* PNG + targetSize Uyarısı */}
          {isPngWithTargetSize && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-500 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-500 mb-1">
                    {t('resize.pngTargetSizeWarningTitle') || 'PNG + Hedef Boyut Uyarısı'}
                  </p>
                  <p className="text-xs text-yellow-400/80">
                    {t('resize.pngTargetSizeWarning') || 'PNG kayıpsız bir formattır ve hedef dosya boyutu özelliği ile uyumlu değildir. Dosya boyutu hedeflenen değere düşmeyebilir, hatta artabilir. Boyut küçültme için format dönüştürme sayfasında JPEG, WebP veya AVIF formatlarını kullanın.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleConvert}
            disabled={isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse) || isPngWithTargetSize}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-base
              ${isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse) || isPngWithTargetSize
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105'
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
                {t('resize.optimizeButton')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ResizePage;
