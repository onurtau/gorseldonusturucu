const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Worker thread için Sharp cache ayarları
sharp.cache({ 
  memory: 50,      // Worker başına 50 MB cache
  files: 5,        
  items: 20        
});

// === HELPER FUNCTIONS ===

// Watermark SVG oluşturma (main.js'den kopyalandı)
function createWatermarkSVG(text, width, height, position, opacity, fontSizePercent = 3, color = '#808080', fontFamily = 'Impact', shadow = false, tileEnabled = false, tilePattern = 'diagonal') {
  const fontSize = Math.round((width * fontSizePercent) / 100);
  
  const letterSpacing = fontSizePercent >= 18 ? '0.08em' 
    : fontSizePercent >= 12 ? '0.04em' 
    : '0';
  
  const shadowFilter = shadow ? `
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="${opacity * 0.8}"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>` : '';
  
  if (tileEnabled) {
    let spacingX, spacingY, rotation;
    
    switch (tilePattern) {
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
    
    const cols = Math.ceil(width / spacingX);
    const rows = Math.ceil(height / spacingY);
    
    const marginX = spacingX / 2;
    const marginY = spacingY / 2;
    
    let textElements = '';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = marginX + col * spacingX;
        const y = marginY + row * spacingY;
        
        if (x >= marginX && x <= width - marginX && y >= marginY && y <= height - marginY) {
          textElements += `
      <text
        x="${x}"
        y="${y}"
        font-family="${fontFamily}, Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        fill-opacity="${opacity}"
        text-anchor="middle"
        letter-spacing="${letterSpacing}"
        transform="rotate(${rotation} ${x} ${y})"
        ${shadow ? 'filter="url(#shadow)"' : ''}
      >${text}</text>`;
        }
      }
    }
    
    const svg = `
    <svg width="${width}" height="${height}" style="overflow: hidden;">
      ${shadowFilter}
      ${textElements}
    </svg>
  `;
    
    return Buffer.from(svg);
  }
  
  const padding = Math.max(20, fontSize * 0.5);
  let x, y, anchor;
  
  switch (position) {
    case 'top-left':
      x = padding;
      y = padding + fontSize;
      anchor = 'start';
      break;
    case 'top-right':
      x = width - padding;
      y = padding + fontSize;
      anchor = 'end';
      break;
    case 'bottom-left':
      x = padding;
      y = height - padding;
      anchor = 'start';
      break;
    case 'bottom-right':
      x = width - padding;
      y = height - padding;
      anchor = 'end';
      break;
    case 'center':
    default:
      x = width / 2;
      y = height / 2;
      anchor = 'middle';
      break;
  }
  
  const svg = `
    <svg width="${width}" height="${height}">
      ${shadowFilter}
      <text
        x="${x}"
        y="${y}"
        font-family="${fontFamily}, Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        fill-opacity="${opacity}"
        text-anchor="${anchor}"
        letter-spacing="${letterSpacing}"
        ${shadow ? 'filter="url(#shadow)"' : ''}
      >${text}</text>
    </svg>
  `;
  
  return Buffer.from(svg);
}

// Structured logging - main process'e log gönder
function log(level, message, data = {}) {
  parentPort.postMessage({
    type: 'log',
    level,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// === BINARY SEARCH IMAGE PROCESSING ===

async function processImageWithTargetSize(options) {
  const {
    inputPath,
    outputPath,
    outputFormat,
    targetSize,
    metadata,
    preserveMetadata,
    watermark,
    quality = 90,  // Kullanıcının seçtiği quality (varsayılan 90)
    originalFileSize: passedOriginalSize = null  // main.js'den gelen orijinal dosya boyutu (CMYK→RGB dönüşümünde orijinal CMYK boyutu)
  } = options;

  try {
    const targetBytes = targetSize * 1024;
    // Orijinal dosya boyutunu kullan (parametre olarak gelmemişse stat ile al)
    const originalFileSize = passedOriginalSize || (await fs.stat(inputPath)).size;
    const sizeRatio = originalFileSize / targetBytes;
    const format = outputFormat.toLowerCase();
    const isTiff = (format === 'tiff' || format === 'tif');
    const isJpeg = (format === 'jpeg' || format === 'jpg');
    
    // Tolerance: TIFF için %3, diğerleri için %5
    const tolerance = isTiff ? (targetBytes * 0.03) : (targetBytes * 0.05);
    // MaxIterations: JPEG için 15, TIFF için 20, diğerleri için 15
    const maxIterations = isJpeg ? 15 : (isTiff ? 20 : 15);
    
    // TargetSize kullanıldığında: minQuality=1, maxQuality=100
    // Kullanıcının quality değeri sadece başlangıç noktası olarak kullanılır
    let minQuality = 1;
    let maxQuality = 100;
    let bestQuality = quality; // Kullanıcının quality'sinden başla
    
    log('info', `Kullanıcı Quality: ${quality}% (başlangıç değeri)`);
    log('info', `Binary Search Aralığı: ${minQuality}-${maxQuality}`);
    log('info', `Dosya/Hedef Oranı: ${sizeRatio.toFixed(2)}x`);
    
    let bestBuffer = null;
    let bestDiff = Infinity;
    let iterations = 0;

    log('info', `Hedef boyut: ${targetSize} KB (${targetBytes} bytes)`);
    log('info', `Tolerans: ${Math.round(targetBytes - tolerance)} - ${Math.round(targetBytes + tolerance)} bytes`);
    log('info', `Maksimum iterasyon: ${maxIterations}`);

    // Binary search loop (Worker thread'de çalıştığı için setTimeout gerekmez)
    while (iterations < maxIterations && (maxQuality - minQuality) > 1) {
      // İlk iterasyonda kullanıcının quality değerini kullan, sonra binary search
      const currentQuality = iterations === 0 
        ? bestQuality 
        : Math.round((minQuality + maxQuality) / 2);
      
      // Progress event gönder
      parentPort.postMessage({
        type: 'progress',
        current: iterations + 1,
        total: maxIterations,
        quality: currentQuality
      });
      
      // Image processing
      let processedImage = sharp(inputPath, {
        sequentialRead: true,
        limitInputPixels: 268402689,
        failOnError: false
      });
      
      // NOT: CMYK dosyalar main.js'de ImageMagick ile RGB'ye çevrilir (mükemmel kalite)
      // Worker her zaman RGB dosya alır, renk dönüşümü yapmaz
      
      // Preserve metadata
      if (preserveMetadata) {
        processedImage = processedImage.withMetadata();
      }

      // Watermark
      if (watermark && watermark.enabled && watermark.text) {
        const watermarkSVG = createWatermarkSVG(
          watermark.text,
          metadata.width,
          metadata.height,
          watermark.position || 'bottom-right',
          watermark.opacity || 0.5,
          watermark.fontSizePercent || 3,
          watermark.color || '#808080',
          watermark.fontFamily || 'Impact',
          watermark.shadow || false,
          watermark.tileEnabled || false,
          watermark.tilePattern || 'diagonal'
        );
        
        processedImage = processedImage.composite([{
          input: watermarkSVG,
          top: 0,
          left: 0
        }]);
      }

      // Format-specific output
      let outputBuffer;
      switch (format) {
        case 'jpeg':
        case 'jpg':
          outputBuffer = await processedImage.jpeg({ 
            quality: currentQuality, 
            progressive: true, 
            mozjpeg: true,
            chromaSubsampling: '4:4:4', // Tam renk kalitesi - posterizasyon önleme
            optimiseCoding: true,
            trellisQuantisation: true
          }).toBuffer();
          break;
          
        case 'png':
          const compressionLevel = Math.round((100 - currentQuality) / 10);
          outputBuffer = await processedImage
            .png({ compressionLevel, progressive: true })
            .toBuffer();
          break;
          
        case 'webp':
          const isLossless = targetSize ? false : currentQuality >= 95;
          outputBuffer = await processedImage
            .webp({ 
              quality: currentQuality, 
              lossless: isLossless,
              smartSubsample: true,
              effort: 2
            })
            .toBuffer();
          break;
          
        case 'avif':
          outputBuffer = await processedImage
            .avif({ 
              quality: currentQuality, 
              effort: 2,
              chromaSubsampling: '4:4:4'
            })
            .toBuffer();
          break;
          
        case 'tiff':
          const tiffCompression = (targetSize && targetSize > 0) ? 'jpeg' : 'lzw';
          outputBuffer = await processedImage
            .tiff({ quality: currentQuality, compression: tiffCompression })
            .toBuffer();
          break;
          
        case 'bmp':
          outputBuffer = await processedImage.bmp().toBuffer();
          break;
          
        default:
          throw new Error(`Desteklenmeyen format: ${outputFormat}`);
      }
      
      const currentSize = outputBuffer.length;
      const diff = Math.abs(currentSize - targetBytes);
      
      iterations++;
      log('info', `[${iterations}] Kalite: ${currentQuality}, Boyut: ${Math.round(currentSize / 1024)} KB, Fark: ${Math.round(diff / 1024)} KB`);
      
      // Best result tracking
      if (diff < bestDiff) {
        bestDiff = diff;
        bestBuffer = outputBuffer;
        bestQuality = currentQuality;
      }
      
      // Check tolerance
      if (diff <= tolerance) {
        log('info', `Hedef boyuta ulaşıldı! (Fark: ${Math.round(diff / 1024)} KB)`);
        break;
      }
      
      // Binary search adjustment
      if (currentSize > targetBytes) {
        maxQuality = currentQuality - 1;
      } else {
        minQuality = currentQuality + 1;
      }
    }

    // Use best result
    if (!bestBuffer) {
      throw new Error('TargetSize sıkıştırması başarısız oldu');
    }
    
    await fs.writeFile(outputPath, bestBuffer);
    
    const finalSizeKB = Math.round(bestBuffer.length / 1024);
    const targetDiffKB = Math.round(bestDiff / 1024);
    
    log('info', `TargetSize ile dönüştürüldü: ${outputPath}`);
    log('info', `Sonuç: ${finalSizeKB} KB (Hedef: ${targetSize} KB, Fark: ${targetDiffKB} KB, Kalite: ${bestQuality})`);
    log('info', `Toplam iterasyon: ${iterations}`);
    
    // Orijinal dosya boyutunu al (main.js'den parametre olarak gelmişse onu kullan, yoksa stat ile al)
    const finalOriginalSize = passedOriginalSize || (await fs.stat(inputPath)).size;
    
    return {
      success: true,
      outputPath,
      originalSize: finalOriginalSize,
      newSize: bestBuffer.length,
      compressionRatio: ((1 - bestBuffer.length / finalOriginalSize) * 100).toFixed(2),
      finalQuality: bestQuality
    };
    
  } catch (error) {
    log('error', 'Worker hata:', { 
      message: error.message,
      stack: error.stack 
    });
    
    throw error;
  }
}

// === THUMBNAIL GENERATION ===

async function generateThumbnail(options) {
  const { inputPath, maxWidth, maxHeight } = options;
  
  try {
    log('info', `📸 Thumbnail oluşturuluyor: ${path.basename(inputPath)}`, { maxWidth, maxHeight });
    
    // Sharp ile thumbnail oluştur
    const thumbnailBuffer = await sharp(inputPath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    
    log('info', `✓ Thumbnail oluşturuldu: ${(thumbnailBuffer.length / 1024).toFixed(1)} KB`);
    
    // Base64 encoding
    const base64 = thumbnailBuffer.toString('base64');
    
    return {
      success: true,
      base64: `data:image/jpeg;base64,${base64}`,
      size: thumbnailBuffer.length
    };
    
  } catch (error) {
    log('error', 'Thumbnail oluşturma hatası', { error: error.message });
    throw error;
  }
}

// === WORKER MESSAGE HANDLER ===

parentPort.on('message', async (task) => {
  try {
    let result;
    
    // Task type'a göre routing
    if (task.type === 'generate-thumbnail') {
      result = await generateThumbnail(task);
    } else {
      // Default: TargetSize processing
      result = await processImageWithTargetSize(task);
    }
    
    // Success response
    parentPort.postMessage({
      type: 'result',
      data: result
    });
    
  } catch (error) {
    // Error response
    parentPort.postMessage({
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
  }
});
