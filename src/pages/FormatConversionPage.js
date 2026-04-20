import React, { useState, useEffect } from 'react';
import { FileImage, ArrowRight, Check } from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import FileList from '../components/FileList';
import ProcessingStatusBar from '../components/ProcessingStatusBar';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import * as imageProcessor from '../services/imageProcessor';
import * as trialManager from '../services/trialManager';

const FormatConversionPage = ({ onBackToLanding }) => {
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
  const { user } = useAuthStore();
  const { t } = useLanguage();

  // Set active view on mount
  useEffect(() => {
    setActiveView('format-conversion');
  }, [setActiveView]);

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];
  const activeSelectedFiles = selectedFiles[ui.activeView] || [];

  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFolder, setOutputFolder] = useState(null); // Resume için klasör yolu

  const formats = [
    { value: 'jpg', label: 'JPG', description: t('formatConversion.formats.jpg.description') },
    { value: 'png', label: 'PNG', description: t('formatConversion.formats.png.description') },
    { value: 'webp', label: 'WebP', description: t('formatConversion.formats.webp.description') },
    { value: 'avif', label: 'AVIF', description: t('formatConversion.formats.avif.description') },
    { value: 'tiff', label: 'TIFF', description: t('formatConversion.formats.tiff.description') }
  ];

  const handleConvert = async () => {
    const isElectron = imageProcessor.isElectron;

    // Platform ve kullanıcı durumuna göre izin kontrolü
    const permission = trialManager.checkUsagePermission(isElectron, user, license);
    
    if (!permission.canUse) {
      if (permission.reason === 'trial-expired') {
        // Web + Kayıtsız kullanıcı + Trial bitti
        addNotification({
          type: 'warning',
          title: t('notifications.trialExpired') || '3 ücretsiz denemeniz bitti',
          message: t('notifications.pleaseRegister') || 'Devam etmek için kayıt olun veya premium satın alın.'
        });
      } else {
        // Diğer durumlar (license limit vs)
        addNotification({
          type: 'warning',
          title: t('notifications.limitReached'),
          message: t('notifications.needPremium')
        });
      }
      return;
    }

    const filesToConvert = activeFiles.filter(f => activeSelectedFiles.includes(f.id));

    if (filesToConvert.length === 0) {
      addNotification({
        type: 'warning',
        title: t('notifications.noFileSelected'),
        message: t('notifications.noFiles')
      });
      return;
    }

    setIsProcessing(true);
    setBatchProcessing(true);

    try {
      if (filesToConvert.length === 1) {
        // Tek dosya
        const fileObj = filesToConvert[0];
        
        console.log('[Format Conversion] Processing file:', fileObj);
        console.log('[Format Conversion] File object:', fileObj.file);
        console.log('[Format Conversion] isElectron:', isElectron);
        
        // Dosya adından mevcut uzantıyı çıkar ve yeni uzantıyı ekle
        const baseFileName = fileObj.name.replace(/\.[^.]+$/, '');
        const defaultFileName = `${baseFileName}.${selectedFormat}`;

        updateFileStatus(fileObj.id, t('common.processing'), 50);

        if (isElectron) {
          // Electron: Save dialog + local processing
          const formatFilters = [
            { name: `${selectedFormat.toUpperCase()} Dosyası`, extensions: [selectedFormat] }
          ];
          
          const saveResult = await window.electronAPI.saveFile(
            defaultFileName,
            formatFilters
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
          if (currentExt !== selectedFormat) {
            // Mevcut uzantıyı kaldır ve doğru uzantıyı ekle
            outputPath = outputPath.replace(/\.[^.]+$/, '') + `.${selectedFormat}`;
          }

          const result = await window.electronAPI.convertImage({
            inputPath: fileObj.path,
            outputPath: outputPath,
            outputFormat: selectedFormat,
            quality: 90,
            preserveMetadata: true
          });

          if (result.success) {
            updateFileStatus(fileObj.id, t('common.completed'), 100, result);
            await window.electronAPI.incrementUsage();
            incrementUsage();
            
            updateStats({
              sizeSaved: result.originalSize - result.newSize,
              compressionRatio: parseFloat(result.compressionRatio) || 0
            });
            
            // İstatistik kaydı
            const originalExt = fileObj.name.split('.').pop().toLowerCase();
            recordStatistic('format-conversion', {
              formatConversions: [{ from: originalExt, to: selectedFormat, count: 1 }],
              originalTotalSize: result.originalSize,
              newTotalSize: result.newSize,
              fileCount: 1
            });

            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} ${t('notifications.convertedTo')} ${selectedFormat.toUpperCase()}.`
            });
          } else {
            updateFileStatus(fileObj.id, t('common.error'), 0, { error: result.error });
            addNotification({
              type: 'error',
              title: t('notifications.error'),
              message: result.error
            });
          }
        } else {
          // Web: API call + auto download
          try {
            console.log('[Format Conversion] Calling imageProcessor.convertImage...');
            console.log('[Format Conversion] File:', fileObj.file);
            console.log('[Format Conversion] Options:', { format: selectedFormat, quality: 90 });
            
            const blob = await imageProcessor.convertImage(fileObj.file, {
              format: selectedFormat,
              quality: 90
            });

            console.log('[Format Conversion] Conversion successful, blob size:', blob.size);

            // Download the result
            imageProcessor.downloadFile(blob, defaultFileName);

            updateFileStatus(fileObj.id, t('common.completed'), 100);
            incrementUsage();
            
            // Web'de kayıtsız kullanıcılar için trial kullanımını artır
            if (!isElectron && !user) {
              const remaining = trialManager.incrementTrialUsage(user);
              if (remaining <= 1) {
                addNotification({
                  type: 'info',
                  title: t('notifications.trialWarning') || 'Deneme hakkınız azalıyor',
                  message: t('notifications.trialsRemaining', { count: remaining }) || `${remaining} deneme hakkınız kaldı. Kayıt olun!`
                });
              }
            }

            addNotification({
              type: 'success',
              title: t('notifications.success'),
              message: `${fileObj.name} ${t('notifications.convertedTo')} ${selectedFormat.toUpperCase()}.`
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
      } else {
        // Toplu dönüştürme
        
        if (isElectron) {
          // Electron: Klasör seç + toplu işleme
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

            // Dosya adından uzantıyı çıkar ve doğru uzantıyı ekle
            const baseFileName = file.name.replace(/\.[^.]+$/, '');
            const outputPath = `${selectedOutputFolder}/${baseFileName}.${selectedFormat}`;

            const result = await window.electronAPI.convertImage({
              inputPath: file.path,
              outputPath: outputPath,
              outputFormat: selectedFormat,
              quality: 90,
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
              
              const originalExt = file.name.split('.').pop().toLowerCase();
              const conversionKey = `${originalExt}->${selectedFormat}`;
              formatConversionsMap[conversionKey] = (formatConversionsMap[conversionKey] || 0) + 1;
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
          
          addNotification({
            type: 'success',
            title: t('notifications.completed'),
            message: `${filesToConvert.length} ${t('notifications.filesConverted')}`
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
        } else {
          // Web: Basit toplu işleme (her dosyayı ayrı ayrı indir)
          updateBatchProgress(0, filesToConvert.length);
          
          let processedCount = 0;
          let successCount = 0;

          for (const fileObj of filesToConvert) {
            try {
              updateFileStatus(fileObj.id, t('common.processing'), 50);

              const blob = await imageProcessor.convertImage(fileObj.file, {
                format: selectedFormat,
                quality: 90
              });

              // Dosya adından uzantıyı çıkar ve doğru uzantıyı ekle
              const baseFileName = fileObj.name.replace(/\.[^.]+$/, '');
              const defaultFileName = `${baseFileName}.${selectedFormat}`;

              // Download
              imageProcessor.downloadFile(blob, defaultFileName);

              updateFileStatus(fileObj.id, t('common.completed'), 100);
              incrementUsage();
              
              // Web'de kayıtsız kullanıcılar için trial kullanımını artır
              if (!user) {
                trialManager.incrementTrialUsage(user);
              }
              
              successCount++;

            } catch (error) {
              updateFileStatus(fileObj.id, t('common.error'), 0, { error: error.message });
            }

            processedCount++;
            updateBatchProgress(processedCount, filesToConvert.length);

            // Her dosya arasında kısa bir gecikme (browser'ın çökmemesi için)
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          addNotification({
            type: 'success',
            title: t('notifications.completed'),
            message: `${successCount}/${filesToConvert.length} ${t('notifications.filesConverted')}`
          });
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
          <FileImage className="w-7 h-7 text-blue-400" />
          {t('formatConversion.title')}
        </h2>
        <p className="text-gray-400">{t('formatConversion.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {/* Format Seçimi */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <h3 className="text-base font-semibold text-white mb-3">{t('formatConversion.selectFormat')}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`
                    relative p-3 rounded-lg border-2 text-left transition-all
                  ${selectedFormat === format.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                  }
                `}
              >
                {selectedFormat === format.value && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div className="font-bold text-white text-base mb-1">{format.label}</div>
                <div className="text-xs text-gray-400">{format.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 {t('formatConversion.selectedFormat')}: <span className="font-bold">{selectedFormat.toUpperCase()}</span>
            </p>
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
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105'
              }
            `}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('formatConversion.converting')}
              </>
            ) : (
              <>
                {t('formatConversion.convert')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default FormatConversionPage;
