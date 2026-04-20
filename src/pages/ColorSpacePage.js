import React, { useState, useEffect } from 'react';
import { Palette, ArrowRight, ArrowLeftRight, FileWarning, ExternalLink } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import FileList from '../components/FileList';
import ProcessingStatusBar from '../components/ProcessingStatusBar';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';
import * as imageProcessor from '../services/imageProcessor';

const ColorSpacePage = ({ onBackToLanding }) => {
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
    setActiveView('colorspace');
  }, [setActiveView]);

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  const [colorSpace, setColorSpace] = useState('rgb');
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

    // CMYK format kontrolü
    if (colorSpace === 'cmyk') {
      const incompatibleFiles = filesToConvert.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return !['tiff', 'tif', 'jpeg', 'jpg'].includes(ext);
      });

      if (incompatibleFiles.length > 0) {
        const incompatibleFormats = [...new Set(incompatibleFiles.map(f => f.name.split('.').pop().toUpperCase()))];
        
        addNotification({
          type: 'warning',
          title: t('colorSpace.cmykWarning.title'),
          message: t('colorSpace.cmykWarning.message', { formats: incompatibleFormats.join(', ') }),
          duration: 8000,
          action: {
            label: t('colorSpace.cmykWarning.action'),
            onClick: () => {
              setActiveView('conversion');
            }
          }
        });
        return;
      }
    }

    setIsProcessing(true);
    setBatchProcessing(true);

    try {
      if (!isElectron) {
        // WEB VERSION - Simple implementation
        for (const fileObj of filesToConvert) {
          updateFileStatus(fileObj.id, t('common.processing'), 50);
          
          try {
            const blob = await imageProcessor.convertColorSpace(fileObj.file, {
              colorspace: colorSpace
            });

            const newFilename = fileObj.name.replace(/\.[^.]+$/, `.${colorSpace === 'cmyk' ? 'tiff' : 'jpg'}`);
            imageProcessor.downloadFile(blob, newFilename);
            updateFileStatus(fileObj.id, t('common.completed'), 100);
            
            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} → ${colorSpace.toUpperCase()}`
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
          convertColorSpace: colorSpace,
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
          recordStatistic('colorspace', {
            fromColorSpace: result.originalColorSpace || 'srgb',
            toColorSpace: result.targetColorSpace || colorSpace,
            fileCount: 1
          });

          addNotification({
            type: 'success',
            title: t('notifications.success'),
            message: `${file.name} → ${colorSpace.toUpperCase()} ${t('colorSpace.converted')}.`
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
        let firstSuccessfulResult = null;
        
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
              convertColorSpace: colorSpace,
              preserveMetadata: true
            });

            if (result.success) {
              // İlk başarılı sonucu kaydet (istatistik için)
              if (!firstSuccessfulResult) {
                firstSuccessfulResult = result;
              }
              
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
          if (successfulFiles.length > 0 && firstSuccessfulResult) {
            // İlk başarılı dosyanın renk uzayı bilgisini kullan
            recordStatistic('colorspace', {
              fromColorSpace: firstSuccessfulResult.originalColorSpace || 'srgb',
              toColorSpace: firstSuccessfulResult.targetColorSpace || colorSpace,
              fileCount: successfulFiles.length
            });
          }
          
          addNotification({
            type: 'success',
            title: t('notifications.completed'),
            message: `${filesToConvert.length} ${t('colorSpace.filesConverted')}.`
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
    <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-5xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Palette className="w-7 h-7 text-purple-400" />
          {t('colorSpace.title')}
        </h2>
        <p className="text-gray-400">{t('colorSpace.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {/* Renk Uzayı Seçimi */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <h3 className="text-base font-semibold text-white mb-3">{t('colorSpace.targetColorSpace')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* RGB */}
            <button
              onClick={() => setColorSpace('rgb')}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${colorSpace === 'rgb'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  RGB
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base">RGB</h4>
                  <p className="text-xs text-gray-400">Red, Green, Blue</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 mb-1.5">
                • {t('colorSpace.rgbItem1')}
              </p>
              <p className="text-xs text-gray-300 mb-1.5">
                • {t('colorSpace.rgbItem2')}
              </p>
              <p className="text-xs text-gray-300">
                • {t('colorSpace.rgbItem3')}
              </p>
            </button>

            {/* CMYK */}
            <button
              onClick={() => setColorSpace('cmyk')}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${colorSpace === 'cmyk'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-magenta-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                  CMYK
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base">CMYK</h4>
                  <p className="text-xs text-gray-400">Cyan, Magenta, Yellow, Black</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                • {t('colorSpace.cmykItem1')}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                • {t('colorSpace.cmykItem2')}
              </p>
              <p className="text-sm text-gray-300">
                • {t('colorSpace.cmykItem3')}
              </p>
            </button>
          </div>

          {/* Bilgi */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <ArrowLeftRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1">{t('colorSpace.conversionInfo')}</h4>
              <p className="text-xs text-purple-200">
                {t('colorSpace.conversionInfoText')}
              </p>
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
          <button
            onClick={handleConvert}
            disabled={isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse)}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-base
              ${isProcessing || activeSelectedFiles.length === 0 || (!imageProcessor.isElectron ? false : !license.canUse)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:scale-105'
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
                {t('common.convert')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ColorSpacePage;
