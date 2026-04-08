import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const WatermarkPreview = React.memo(() => {
  const { files, conversionSettings, ui } = useAppStore();
  const { t } = useLanguage();
  
  // State hooks - ALWAYS call hooks before any conditional returns
  const [previewUrl, setPreviewUrl] = useState(null);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [imageWidth, setImageWidth] = useState(0);
  const [previewFontSize, setPreviewFontSize] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const imageRef = useRef(null);

  // Aktif view'deki dosyaları al
  const activeFiles = files[ui.activeView] || [];

  // Watermark pozisyon helper functions
  const getAlignItems = (position) => {
    if (position.includes('top')) return 'flex-start';
    if (position.includes('bottom')) return 'flex-end';
    return 'center';
  };

  const getJustifyContent = (position) => {
    if (position.includes('left')) return 'flex-start';
    if (position.includes('right')) return 'flex-end';
    return 'center';
  };

  // Image yüklendiğinde boyutları kaydet
  const handleImageLoad = () => {
    if (!imageRef.current) return;

    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;
    setNaturalDimensions({ width: naturalWidth, height: naturalHeight });

    // Landscape/Portrait kontrolü
    const landscape = naturalWidth > naturalHeight;
    setIsLandscape(landscape);

    // Render edilen genişliği al
    const renderedWidth = imageRef.current.clientWidth;
    setImageWidth(renderedWidth);

    // Font boyutunu hesapla
    const fontSize = Math.round((renderedWidth * conversionSettings.watermark.fontSizePercent) / 100);
    setPreviewFontSize(fontSize);
  };

  // Window resize durumunda yeniden hesapla
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const renderedWidth = imageRef.current.clientWidth;
        setImageWidth(renderedWidth);
        const fontSize = Math.round((renderedWidth * conversionSettings.watermark.fontSizePercent) / 100);
        setPreviewFontSize(fontSize);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [conversionSettings.watermark.fontSizePercent]);

  // Watermark ayarları değiştiğinde font size'ı güncelle
  useEffect(() => {
    if (imageWidth > 0) {
      const fontSize = Math.round((imageWidth * conversionSettings.watermark.fontSizePercent) / 100);
      setPreviewFontSize(fontSize);
    }
  }, [conversionSettings.watermark.fontSizePercent, imageWidth]);

  // Preview URL oluştur ve cleanup yap (LAZY LOADING: Sadece ilk dosya)
  useEffect(() => {
    // Dosya yoksa işlem yapma
    if (!activeFiles || activeFiles.length === 0) {
      setPreviewUrl(null);
      return;
    }

    // Önce mevcut URL'i temizle
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Yeni URL oluştur - SADECE İLK DOSYA İÇİN (Lazy Loading Optimizasyonu)
    const firstFile = activeFiles[0];
    if (!firstFile) {
      setPreviewUrl(null);
      return;
    }

    if (firstFile.file && firstFile.file instanceof File) {
      // Browser File object varsa
      try {
        const url = URL.createObjectURL(firstFile.file);
        setPreviewUrl(url);
      } catch (error) {
        console.error('createObjectURL hatası:', error);
        setPreviewUrl(null);
      }
    } else if (firstFile.path && window.electronAPI) {
      // Electron path varsa - Worker Thread ile thumbnail oluşturulacak
      window.electronAPI.getPreviewData(firstFile.path)
        .then(dataUrl => {
          setPreviewUrl(dataUrl);
        })
        .catch(error => {
          console.error('Preview data alınamadı:', error);
          setPreviewUrl(null);
        });
    } else {
      setPreviewUrl(null);
    }

    // Cleanup
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [activeFiles[0]?.id, activeFiles[0]?.file?.name, activeFiles[0]?.path]);

  // Tiled watermarks hesaplama - useMemo ile optimize
  const tiledWatermarks = useMemo(() => {
    if (!conversionSettings.watermark.text || 
        !conversionSettings.watermark.tileEnabled || 
        imageWidth === 0 ||
        !previewFontSize ||
        !imageRef.current) {
      return null;
    }

    const imgWidth = imageWidth;
    const imgHeight = imageRef.current.clientHeight;
    const pattern = conversionSettings.watermark.tilePattern || 'diagonal';
    const fontSize = previewFontSize;
    
    // Pattern'e göre spacing ve rotation - electron/main.js ile AYNI
    let spacingX, spacingY, rotation;
    
    switch (pattern) {
      case 'diagonal':
        spacingX = fontSize * 8;
        spacingY = fontSize * 4;
        rotation = -45;
        break;
      case 'diagonal-reverse':
        spacingX = fontSize * 8;
        spacingY = fontSize * 4;
        rotation = 45;
        break;
      case 'grid':
        spacingX = fontSize * 8;
        spacingY = fontSize * 4;
        rotation = 0;
        break;
      case 'dense':
        spacingX = fontSize * 5;
        spacingY = fontSize * 3;
        rotation = -45;
        break;
      default:
        spacingX = fontSize * 8;
        spacingY = fontSize * 4;
        rotation = -45;
    }
    
    // Grid hesaplama
    const cols = Math.ceil(imgWidth / spacingX);
    const rows = Math.ceil(imgHeight / spacingY);
    
    const totalGridWidth = (cols - 1) * spacingX;
    const totalGridHeight = (rows - 1) * spacingY;
    
    const offsetX = (imgWidth - totalGridWidth) / 2;
    const offsetY = (imgHeight - totalGridHeight) / 2;
    
    // Grid oluştur
    const watermarks = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * spacingX;
        const y = offsetY + row * spacingY;
        
        watermarks.push(
          <span
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              fontFamily: `${conversionSettings.watermark.fontFamily}, Arial, sans-serif`,
              fontSize: `${fontSize}px`,
              color: conversionSettings.watermark.color,
              opacity: conversionSettings.watermark.opacity,
              fontWeight: 'bold',
              letterSpacing: conversionSettings.watermark.fontSizePercent >= 18 ? '0.08em' 
                : conversionSettings.watermark.fontSizePercent >= 12 ? '0.04em' 
                : 'normal',
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              ...(conversionSettings.watermark.shadow && {
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              })
            }}
          >
            {conversionSettings.watermark.text}
          </span>
        );
      }
    }
    
    return watermarks;
  }, [
    conversionSettings.watermark.text,
    conversionSettings.watermark.tileEnabled,
    conversionSettings.watermark.tilePattern,
    conversionSettings.watermark.fontFamily,
    conversionSettings.watermark.color,
    conversionSettings.watermark.opacity,
    conversionSettings.watermark.fontSizePercent,
    conversionSettings.watermark.shadow,
    previewFontSize,
    imageWidth
  ]);

  // Dosya yoksa veya Preview URL yoksa gösterme
  // NOT: Bu koşullu return TÜM hook'lardan SONRA olmalı
  if (!activeFiles || activeFiles.length === 0 || !previewUrl) {
    return null;
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-400" />
          <h4 className="text-lg font-semibold text-white">{t('watermarkPreview.livePreview')}</h4>
        </div>
        
        <div className="flex items-center gap-3">
          {conversionSettings.watermark.text && (
            <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded font-medium">
              {t('watermarkPreview.watermarkActive')}
            </span>
          )}
        </div>
      </div>
      
      {/* Preview Container BG - Sadece background ve center, boyut tamamen serbest */}
      <div className="bg-dark-900 rounded-lg flex items-center justify-center p-4 overflow-auto">
        
        {/* Preview Wrapper - INLINE-BLOCK: Image boyutuna sarılır */}
        <div className="relative inline-block rounded-lg shadow-2xl">
          {/* Image - Landscape/Portrait'e göre dinamik büyüt */}
          <img 
            ref={imageRef}
            src={previewUrl} 
            alt={t('watermarkPreview.preview')}
            className="block rounded-lg"
            style={isLandscape ? {
              width: '1000px',
              height: 'auto'
            } : {
              height: '700px',
              width: 'auto'
            }}
            onLoad={handleImageLoad}
          />
          
          {/* Watermark Overlay - Container'ın TAM ÜZERİNDE (absolute + inset-0) */}
          {imageWidth > 0 && conversionSettings.watermark.text && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              
              {/* Normal Mode - Tek pozisyon */}
              {!conversionSettings.watermark.tileEnabled && (
                <div 
                  className="absolute inset-0"
                  style={{
                    display: 'flex',
                    alignItems: getAlignItems(conversionSettings.watermark.position),
                    justifyContent: getJustifyContent(conversionSettings.watermark.position),
                    padding: `${Math.max(10, previewFontSize * 0.3)}px`
                  }}
                >
                  <span
                    style={{
                      fontFamily: `${conversionSettings.watermark.fontFamily}, Arial, sans-serif`,
                      fontSize: `${previewFontSize}px`,
                      color: conversionSettings.watermark.color,
                      opacity: conversionSettings.watermark.opacity,
                      fontWeight: 'bold',
                      letterSpacing: conversionSettings.watermark.fontSizePercent >= 18 ? '0.08em' 
                        : conversionSettings.watermark.fontSizePercent >= 12 ? '0.04em' 
                        : 'normal',
                      ...(conversionSettings.watermark.shadow && {
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      })
                    }}
                  >
                    {conversionSettings.watermark.text}
                  </span>
                </div>
              )}

              {/* Tiled Mode - Döşeme pattern */}
              {conversionSettings.watermark.tileEnabled && tiledWatermarks}
              
            </div>
          )}
        </div>
      </div>
      
      {/* Watermark placeholder */}
      {!conversionSettings.watermark.text && (
        <div className="px-4 py-3 bg-dark-700/30 flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            {t('watermarkPreview.enterWatermarkText')}
          </p>
        </div>
      )}

      {/* Bilgi Footer */}
      <div className="p-3 bg-dark-700/50 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{t('watermarkPreview.imageSize')}</span>
          <span className="text-gray-200 font-mono">
            {naturalDimensions.width} × {naturalDimensions.height}px
          </span>
        </div>
        {imageWidth > 0 && imageRef.current && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Önizleme Boyutu</span>
            <span className="text-gray-400 font-mono">
              {Math.round(imageWidth)} × {Math.round(imageRef.current.clientHeight)}px
            </span>
          </div>
        )}
        {conversionSettings.watermark.text && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{t('watermarkPreview.watermarkFont')}</span>
            <span className="text-primary-400 font-mono font-medium">
              {Math.round((naturalDimensions.width * conversionSettings.watermark.fontSizePercent) / 100)}px 
              <span className="text-gray-500"> (%{conversionSettings.watermark.fontSizePercent})</span>
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t border-dark-600">
          <p className="text-xs text-gray-500 text-center">
            {t('watermarkPreview.liveUpdateTip')}
          </p>
        </div>
      </div>
    </div>
  );
});

WatermarkPreview.displayName = 'WatermarkPreview';

export default WatermarkPreview;
