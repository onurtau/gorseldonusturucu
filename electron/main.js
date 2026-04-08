const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');
const sharp = require('sharp');
const { exec, execSync } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { Worker } = require('worker_threads');

// Cache izin hatalarını önle (app.whenReady'den önce çağrılmalı)
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// === WORKER POOL MANAGER ===
class WorkerPool {
  constructor(workerPath, poolSize = 4) {
    this.workerPath = workerPath;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeWorkers = new Set();
    
    // Initialize worker pool
    for (let i = 0; i < poolSize; i++) {
      this.createWorker(i);
    }
  }
  
  createWorker(id) {
    const worker = new Worker(this.workerPath);
    worker.workerId = id;
    worker.busy = false;
    
    this.workers.push(worker);
    
    return worker;
  }
  
  async executeTask(task) {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks = {
        ...task,
        resolve,
        reject
      };
      
      // Try to find available worker
      const availableWorker = this.workers.find(w => !w.busy);
      
      if (availableWorker) {
        this.runOnWorker(availableWorker, taskWithCallbacks);
      } else {
        // Queue the task
        this.queue.push(taskWithCallbacks);
      }
    });
  }
  
  runOnWorker(worker, task) {
    worker.busy = true;
    this.activeWorkers.add(worker.workerId);
    
    // Set up message handlers
    const onMessage = (msg) => {
      if (msg.type === 'result') {
        cleanup();
        task.resolve(msg.data);
      } else if (msg.type === 'error') {
        cleanup();
        const error = new Error(msg.error.message);
        error.stack = msg.error.stack;
        task.reject(error);
      } else if (msg.type === 'progress') {
        // Forward progress to main window
        if (mainWindow) {
          mainWindow.webContents.send('iteration-progress', {
            current: msg.current,
            total: msg.total,
            quality: msg.quality
          });
          
          const progressValue = msg.current / msg.total;
          mainWindow.setProgressBar(progressValue);
        }
      } else if (msg.type === 'log') {
        // Forward logs to console
        const logPrefix = `[Worker ${worker.workerId}]`;
        switch (msg.level) {
          case 'info':
            console.log(logPrefix, msg.message, msg.data);
            break;
          case 'warn':
            console.warn(logPrefix, msg.message, msg.data);
            break;
          case 'error':
            console.error(logPrefix, msg.message, msg.data);
            break;
        }
      }
    };
    
    const onError = (error) => {
      cleanup();
      task.reject(error);
    };
    
    const cleanup = () => {
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.busy = false;
      this.activeWorkers.delete(worker.workerId);
      
      // Reset progress bar
      if (mainWindow) {
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send('iteration-progress', {
          current: 0,
          total: 0,
          quality: 0
        });
      }
      
      // Process next task in queue
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this.runOnWorker(worker, nextTask);
      }
    };
    
    worker.on('message', onMessage);
    worker.on('error', onError);
    
    // Send task to worker - resolve/reject fonksiyonlarını çıkar (serialize edilemez)
    const { resolve, reject, ...taskData } = task;
    worker.postMessage(taskData);
  }
  
  async terminate() {
    await Promise.all(this.workers.map(w => w.terminate()));
    this.workers = [];
    this.queue = [];
    this.activeWorkers.clear();
  }
}

// Initialize worker pool (4 workers)
let workerPool = null;

// Thumbnail cache system (SVG cache benzeri)
const thumbnailCache = new Map();
const MAX_THUMBNAIL_CACHE_SIZE = 50;

function initializeWorkerPool() {
  if (!workerPool) {
    const workerPath = path.join(__dirname, 'imageWorker.js');
    workerPool = new WorkerPool(workerPath, 4);
    console.log('✓ Worker pool initialized (4 workers)');
  }
}

// === WORKER POOL MANAGER (END) ===


// === ImageMagick Kontrolü ===
let imageMagickAvailable = false;
try {
  execSync('magick -version', { stdio: 'ignore' });
  imageMagickAvailable = true;
  console.log('✓ ImageMagick bulundu - CMYK desteği aktif');
} catch (error) {
  console.warn('⚠ ImageMagick bulunamadı - CMYK JPEG/TIFF sınırlı destek');
}
// === ImageMagick Kontrolü (SON) ===

// === BELLEK OPTİMİZASYONU ===
// Sharp cache ayarları (RAM kullanımını sınırla)
sharp.cache({ 
  memory: 100,     // Maksimum 100 MB cache (varsayılan 512 MB)
  files: 10,       // Maksimum 10 dosya cache'de
  items: 50        // Maksimum 50 işlem cache'de
});

// Sharp concurrency (eşzamanlılık) ayarı
sharp.concurrency(4); // Aynı anda maksimum 4 işlem (CPU core sayısına göre)

// === HELPER FUNCTIONS ===
/**
 * Dosya adı çakışmasını önlemek için benzersiz output path oluşturur
 * Örnek: IMG_001.webp → IMG_001 (1).webp → IMG_001 (2).webp
 */
function getUniqueOutputPath(outputPath) {
  const fsSync = require('fs');
  
  // Dosya yoksa, normal path'i döndür
  if (!fsSync.existsSync(outputPath)) {
    return outputPath;
  }
  
  // Dosya var, numaralandırma yap
  const ext = path.extname(outputPath); // .webp
  const basePath = outputPath.slice(0, -ext.length); // D:\Converted\IMG_001
  
  let counter = 1;
  let newPath;
  
  while (true) {
    newPath = `${basePath} (${counter})${ext}`; // IMG_001 (1).webp
    
    if (!fsSync.existsSync(newPath)) {
      return newPath; // Boş slot bulundu
    }
    
    counter++;
  }
}
// === HELPER FUNCTIONS (SON) ===

// Bellek temizleme fonksiyonu
function clearSharpCache() {
  sharp.cache(false);  // Cache'i devre dışı bırak
  sharp.cache(true);   // Yeniden aktif et (temizlenmiş halde)
}
// === BELLEK OPTİMİZASYONU (SON) ===

// Kullanıcı ayarları ve lisans bilgileri için store
const store = new Store();

let mainWindow;

// Ana pencereyi oluştur
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Görsel Dönüştürücü - Profesyonel Görüntü İşleme',
    show: false
  });

  // Geliştirme ortamında mı kontrol et
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production build için doğru path
    const indexPath = path.join(__dirname, '../build/index.html');
    mainWindow.loadFile(indexPath);
    
    // Debug için
    console.log('Loading from:', indexPath);
    console.log('__dirname:', __dirname);
    console.log('app.isPackaged:', app.isPackaged);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();
  initializeWorkerPool(); // Worker pool'u başlat

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (workerPool) {
      workerPool.terminate();
    }
    app.quit();
  }
});

// ============= IPC İLETİŞİM HANDLERs =============

// Dosya seçme dialogu
ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { 
        name: 'Görseller', 
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'avif', 'svg', 'ico'] 
      },
      { name: 'Tüm Dosyalar', extensions: ['*'] }
    ]
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  // Dosya bilgilerini topla
  const filesInfo = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const stats = await fs.stat(filePath);
      const metadata = await getImageMetadata(filePath);
      
      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        extension: path.extname(filePath).toLowerCase().slice(1),
        ...metadata
      };
    })
  );
  
  return { canceled: false, files: filesInfo };
});

// Kaydetme yeri seçme
ipcMain.handle('dialog:saveFile', async (event, defaultName, customFilters = null) => {
  const defaultFilters = [
    { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
    { name: 'PNG', extensions: ['png'] },
    { name: 'WebP', extensions: ['webp'] },
    { name: 'AVIF', extensions: ['avif'] },
    { name: 'TIFF', extensions: ['tiff', 'tif'] },
    { name: 'BMP', extensions: ['bmp'] }
  ];
  
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: customFilters || defaultFilters
  });
  
  return result;
});

// Klasör seçme (toplu kaydetme için)
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  return result;
});

// Görüntü metadata bilgilerini al
async function getImageMetadata(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space, // RGB, CMYK, sRGB, etc.
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
      iccProfile: metadata.icc ? true : false
    };
  } catch (error) {
    console.error('Metadata okuma hatası:', error);
    return {
      width: 0,
      height: 0,
      format: 'bilinmiyor'
    };
  }
}

// === WATERMARK FONKSİYONU ===
// Watermark SVG Cache (performans optimizasyonu)
const watermarkCache = new Map();
const MAX_CACHE_SIZE = 100;

function createWatermarkSVG(text, width, height, position, opacity, fontSizePercent = 3, color = '#808080', fontFamily = 'Impact', shadow = false, tileEnabled = false, tilePattern = 'diagonal') {
  // Cache key oluştur (tüm parametreleri içerir)
  const cacheKey = `${text}_${width}_${height}_${position}_${opacity}_${fontSizePercent}_${color}_${fontFamily}_${shadow}_${tileEnabled}_${tilePattern}`;
  
  // Cache'de varsa direkt döndür
  if (watermarkCache.has(cacheKey)) {
    return watermarkCache.get(cacheKey);
  }
  
  // Cache boyutu kontrolü (LRU benzeri: eski girişleri sil)
  if (watermarkCache.size >= MAX_CACHE_SIZE) {
    const firstKey = watermarkCache.keys().next().value;
    watermarkCache.delete(firstKey);
  }
  
  // Yüzde bazlı font boyutu hesaplama (görsel genişliğine göre)
  const fontSize = Math.round((width * fontSizePercent) / 100);
  
  // Letter spacing hesapla (büyük fontlarda harf aralığı)
  const letterSpacing = fontSizePercent >= 18 ? '0.08em' 
    : fontSizePercent >= 12 ? '0.04em' 
    : '0';
  
  // Shadow filter tanımı (her iki mod için de aynı)
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
  
  // TILED (Döşeme) Modu - Tüm ekrana yayılmış pattern
  if (tileEnabled) {
    // Pattern'e göre spacing ve rotation hesapla
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
        spacingX = fontSize * 5; // Daha sık
        spacingY = fontSize * 3;
        rotation = -45;
        break;
      default:
        spacingX = fontSize * 8;
        spacingY = fontSize * 4;
        rotation = -45;
    }
    
    // Kaç satır ve sütun gerekli
    const cols = Math.ceil(width / spacingX);
    const rows = Math.ceil(height / spacingY);
    
    // Gerçek grid boyutunu hesapla
    const totalGridWidth = (cols - 1) * spacingX;
    const totalGridHeight = (rows - 1) * spacingY;
    
    // Kalan boşluğu ortala - her iki kenarda dengeli boşluk
    const offsetX = (width - totalGridWidth) / 2;
    const offsetY = (height - totalGridHeight) / 2;
    
    // Tüm text elementlerini oluştur (ortadan başlayıp dengeli dağıt)
    let textElements = '';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * spacingX;
        const y = offsetY + row * spacingY;
        
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
    
    const svg = `
    <svg width="${width}" height="${height}" style="overflow: hidden;">
      ${shadowFilter}
      ${textElements}
    </svg>
  `;
    
    const svgBuffer = Buffer.from(svg);
    watermarkCache.set(cacheKey, svgBuffer);
    return svgBuffer;
  }
  
  // NORMAL Mod - Tek pozisyon
  // Pozisyona göre koordinatları hesapla (font size'a göre dinamik padding)
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
  
  const svgBuffer = Buffer.from(svg);
  watermarkCache.set(cacheKey, svgBuffer);
  return svgBuffer;
}
// === WATERMARK FONKSİYONU (SON) ===

// === BULK RENAME FONKSİYONU ===
function generateBulkFileName(pattern, index, originalName, startNumber, padding, extension) {
  const number = (startNumber + index).toString().padStart(padding, '0');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const original = path.parse(originalName).name;
  
  let fileName = pattern
    .replace('{number}', number)
    .replace('{date}', date)
    .replace('{original}', original);
  
  return `${fileName}.${extension}`;
}
// === BULK RENAME FONKSİYONU (SON) ===

// === ImageMagick CMYK Dönüşümü ===
async function convertWithImageMagick(inputPath, outputPath, format, quality, targetColorSpace = null, targetSize = null) {
  try {
    // Orijinal dosyanın renk uzayını tespit et
    const sharp = require('sharp');
    const inputImage = sharp(inputPath);
    const inputMetadata = await inputImage.metadata();
    const originalColorSpace = inputMetadata.space;
    
    // ImageMagick komutunu oluştur - ICC Profile ile profesyonel renk dönüşümü
    const formatUpper = format.toUpperCase();
    let command;
    let profileArg = '';
    let targetSizeArg = '';
    
    // ICC Profile yolları (assets klasöründe)
    const path = require('path');
    const assetsDir = path.join(__dirname, '..', 'assets');
    const cmykProfile = path.join(assetsDir, 'ISOcoated_v2_eci.icc');
    const srgbProfile = path.join(assetsDir, 'sRGB-IEC61966-2.1.icc');
    
    // Renk uzayı dönüşümü parametresi (ICC Profile ile)
    // Python kodundaki gibi: kaynak profile → hedef profile
    if (targetColorSpace === 'cmyk') {
      // RGB → CMYK dönüşümü
      profileArg = `-profile "${srgbProfile}" -profile "${cmykProfile}"`;
      console.log('ImageMagick: RGB → CMYK (ICC Profile)');
    } else if (targetColorSpace === 'rgb' || targetColorSpace === 'srgb') {
      // CMYK → RGB dönüşümü
      profileArg = `-profile "${cmykProfile}" -profile "${srgbProfile}"`;
      console.log('ImageMagick: CMYK → RGB (ICC Profile)');
    }
    
    // Hedef boyut parametresi (sadece JPEG için)
    if (targetSize && targetSize > 0 && (formatUpper === 'JPEG' || formatUpper === 'JPG')) {
      targetSizeArg = `-define jpeg:extent=${targetSize}KB`;
      console.log(`🎯 ImageMagick hedef boyut: ${targetSize} KB`);
    }
    
    if (formatUpper === 'JPEG' || formatUpper === 'JPG') {
      // JPEG için ICC profile + quality parametresi
      command = `magick convert "${inputPath}" ${profileArg} ${targetSizeArg} -quality ${quality} "${outputPath}"`;
    } else if (formatUpper === 'TIFF' || formatUpper === 'TIF') {
      // TIFF için ICC profile + compression
      const tiffCompression = (targetSize && targetSize > 0) ? 'jpeg' : 'lzw';
      if (targetSize && targetSize > 0) {
        console.log(`⚠️ TIFF targetSize için JPEG compression kullanılacak (LZW kayıpsız olduğu için boyut kontrolü yapmaz)`);
      }
      command = `magick convert "${inputPath}" ${profileArg} -compress ${tiffCompression} -quality ${quality} "${outputPath}"`;
    } else {
      throw new Error(`ImageMagick ile ${formatUpper} desteklenmiyor`);
    }
    
    console.log('ImageMagick komutu:', command);
    console.log('⏳ ImageMagick işlemi başlatılıyor (async)...');
    
    await execPromise(command);
    
    console.log('✓ ImageMagick işlemi tamamlandı');
    
    // Dosya boyutlarını al
    const originalStats = await fs.stat(inputPath);
    const newStats = await fs.stat(outputPath);
    
    const conversionMethod = targetColorSpace 
      ? `ImageMagick (${targetColorSpace.toUpperCase()} dönüşümü)` 
      : 'ImageMagick (renk uzayı korundu)';
    console.log('✓', conversionMethod, 'başarılı');
    
    return {
      success: true,
      outputPath,
      originalSize: originalStats.size,
      newSize: newStats.size,
      compressionRatio: ((1 - newStats.size / originalStats.size) * 100).toFixed(2),
      originalColorSpace: originalColorSpace,
      targetColorSpace: targetColorSpace || originalColorSpace,
      method: conversionMethod
    };
  } catch (error) {
    console.error('ImageMagick hatası:', error.message);
    throw error;
  }
}
// === ImageMagick CMYK Dönüşümü (SON) ===

// Görüntü dönüştürme ana fonksiyonu
ipcMain.handle('image:convert', async (event, options) => {
  const {
    inputPath,
    outputPath: originalOutputPath,
    outputFormat,
    quality = 90,
    targetSize = null, // KB cinsinden hedef boyut
    maintainRatio = true,
    convertColorSpace = null, // 'rgb', 'cmyk', null
    preserveMetadata = true,
    watermark = null // Watermark ayarları: { enabled, text, position, opacity, fontSize, color }
  } = options;

  try {
    // Çakışma önleme: Dosya varsa numaralandır
    const outputPath = getUniqueOutputPath(originalOutputPath);
    const wasRenamed = outputPath !== originalOutputPath;
    // Sharp instance oluştur (PERFORMANS OPTİMİZE)
    let image = sharp(inputPath, {
      sequentialRead: true,      // SSD için hızlı sıralı okuma
      limitInputPixels: 268402689, // Max 16384x16384 pixel
      failOnError: false         // Küçük hatalar için devam et
    });
    const metadata = await image.metadata();

    // === CMYK KORUMA STRATEJİSİ ===
    // Eğer kaynak CMYK ve hedef JPEG/TIFF ise, ImageMagick tercih et
    const format = outputFormat.toLowerCase();
    const isCMYKSource = metadata.space === 'cmyk';
    const isJpegOrTiff = ['jpeg', 'jpg', 'tiff', 'tif'].includes(format);
    const isFormatConversion = !convertColorSpace; // Renk dönüşümü değil, format dönüşümü
    const hasWatermark = watermark && watermark.enabled && watermark.text;
    const hasTargetSize = targetSize && targetSize > 0;
    
    // CMYK + TargetSize uyarısı
    if (isCMYKSource && hasTargetSize && isFormatConversion) {
      console.warn('⚠️ CMYK dosya + TargetSize tespit edildi');
      console.warn('⚠️ TargetSize binary search işlemi sırasında Sharp, CMYK\'yı otomatik RGB\'ye çevirir');
      console.warn('💡 CMYK korumak için: TargetSize olmadan sadece Quality ayarı kullanın');
      console.warn('💡 Veya: RGB output kabul ederek işleme devam edin');
    }
    
    // ImageMagick kullanma koşulları:
    // 1. Kaynak CMYK
    // 2. Hedef JPEG veya TIFF
    // 3. Renk dönüşümü değil (format dönüşümü)
    // 4. Watermark yok (ImageMagick watermark zor)
    // 5. TargetSize yok (ImageMagick -define jpeg:extent posterizasyona neden oluyor)
    // 6. ImageMagick yüklü
    // NOT: TargetSize varsa Worker Thread kullanılacak (CMYK→RGB dönüşür ama kalite mükemmel)
    // NOT: TIFF + targetSize için Sharp binary search tercih edilir (ImageMagick extent desteklemiyor)
    const isTiffWithTargetSize = (format === 'tiff' || format === 'tif') && hasTargetSize;
    if (isCMYKSource && isJpegOrTiff && isFormatConversion && !hasWatermark && !hasTargetSize && !isTiffWithTargetSize && imageMagickAvailable) {
      console.log('🎨 CMYK kaynak dosya tespit edildi');
      console.log('📦 ImageMagick ile CMYK korunarak dönüştürülüyor...');
      
      const result = await convertWithImageMagick(inputPath, outputPath, format, quality, null, targetSize);
      return result;
    } else if (isCMYKSource && isJpegOrTiff && isFormatConversion && !imageMagickAvailable) {
      console.warn('⚠️ CMYK dosya tespit edildi ama ImageMagick bulunamadı!');
      console.warn('⚠️ Sharp ile devam ediliyor - CMYK RGB\'ye dönüştürülebilir');
      console.warn('💡 ImageMagick yüklemek için: https://imagemagick.org/script/download.php');
    }
    // === CMYK KORUMA STRATEJİSİ (SON) ===

    // ICC profil bilgisini sakla
    let iccProfile = null;
    if (metadata.icc && preserveMetadata) {
      iccProfile = metadata.icc;
    }

    // Renk uzayı dönüşümü izleme
    let targetColorSpace = metadata.space; // Varsayılan mevcut renk uzayı
    const originalColorSpace = metadata.space; // Orijinal renk uzayını sakla
    // format değişkeni yukarıda satır 450'de tanımlandı
    
    // Renk uzayı dönüşümü kontrolü
    if (convertColorSpace) {
      if (convertColorSpace === 'rgb' && metadata.space === 'cmyk') {
        // CMYK→RGB dönüşümü: ImageMagick kullan (JPEG/TIFF için)
        if (['jpeg', 'jpg', 'tiff', 'tif'].includes(format) && imageMagickAvailable) {
          console.log('CMYK → RGB dönüşümü için ImageMagick kullanılacak');
          return await convertWithImageMagick(inputPath, outputPath, outputFormat, quality, 'srgb');
        } else {
          // Diğer formatlar için Sharp kullan veya ImageMagick yoksa
          if (!imageMagickAvailable && ['jpeg', 'jpg', 'tiff', 'tif'].includes(format)) {
            console.warn('⚠️ ImageMagick bulunamadı! Sharp ile CMYK→RGB dönüşümü yapılacak (renk kalitesi düşük olabilir)');
          }
          image = image.toColorspace('srgb');
          targetColorSpace = 'srgb';
          console.log('Sharp ile CMYK → RGB dönüşümü uygulandı');
        }
      } else if (convertColorSpace === 'cmyk' && metadata.space !== 'cmyk') {
        // RGB→CMYK dönüşümü: ImageMagick kullan (sadece JPEG/TIFF destekler)
        if (['jpeg', 'jpg', 'tiff', 'tif'].includes(format) && imageMagickAvailable) {
          console.log('RGB → CMYK dönüşümü için ImageMagick kullanılacak');
          return await convertWithImageMagick(inputPath, outputPath, outputFormat, quality, 'cmyk');
        } else {
          if (!imageMagickAvailable && ['jpeg', 'jpg', 'tiff', 'tif'].includes(format)) {
            console.warn('⚠️ ImageMagick bulunamadı! Sharp ile RGB→CMYK dönüşümü desteklenmiyor');
          }
          console.warn(`${outputFormat.toUpperCase()} formatı CMYK desteklemiyor`);
          targetColorSpace = metadata.space; // Kaynak renk uzayını koru
        }
      }
    }

    // Watermark ekleme (eğer aktifse)
    // NOT: Watermark eklerken dosya formatını ve boyutunu korumak önemli!
    let finalQuality = quality; // Quality değişkeni için
    
    if (watermark && watermark.enabled && watermark.text) {
      console.log('🎨 Filigran ekleniyor...');
      
      const isCMYKSource = metadata.space === 'cmyk';
      const isJPEGorTIFF = ['jpeg', 'jpg', 'tiff', 'tif'].includes(format);
      
      // CMYK dosyalara watermark: İki aşamalı işlem (renk uzayı korunmalı)
      if (isCMYKSource && isJPEGorTIFF && imageMagickAvailable) {
        console.log('📌 CMYK dosya tespit edildi - renk uzayı korunarak filigran eklenecek');
        
        // Geçici dosya oluştur
        const tempDir = require('os').tmpdir();
        const tempFileName = `temp_watermark_${Date.now()}.${format}`;
        const tempFilePath = require('path').join(tempDir, tempFileName);
        
        try {
          // Adım 1: Orijinal dosyayı oku (boyut değişmemeli!)
          const originalImage = sharp(inputPath);
          const originalMetadata = await originalImage.metadata();
          
          // Watermark SVG oluştur (orijinal boyutlara göre)
          const watermarkSVG = createWatermarkSVG(
            watermark.text,
            originalMetadata.width,
            originalMetadata.height,
            watermark.position || 'bottom-right',
            watermark.opacity || 0.5,
            watermark.fontSizePercent || 3,
            watermark.color || '#808080',
            watermark.fontFamily || 'Impact',
            watermark.shadow || false,
            watermark.tileEnabled || false,
            watermark.tilePattern || 'diagonal'
          );
          
          // CMYK dosyayı oku, watermark ekle, temp RGB olarak kaydet
          await originalImage
            .composite([{
              input: watermarkSVG,
              top: 0,
              left: 0
            }])
            .withMetadata()
            .jpeg({ quality: 100, progressive: true, mozjpeg: true })
            .toFile(tempFilePath);
          
          console.log('✓ Filigran eklendi (temp RGB file)');
          
          // Adım 2: ImageMagick ile CMYK'ya geri çevir (ICC profile ile)
          await convertWithImageMagick(tempFilePath, outputPath, format, 100, 'cmyk', null);
          console.log('✓ CMYK renk uzayı geri yüklendi');
          
          // Temp dosyayı sil
          if (require('fs').existsSync(tempFilePath)) {
            require('fs').unlinkSync(tempFilePath);
          }
          
          // Sonuçları hesapla
          const originalStats = await fs.stat(inputPath);
          const newStats = await fs.stat(outputPath);
          
          return {
            success: true,
            outputPath,
            originalSize: originalStats.size,
            newSize: newStats.size,
            compressionRatio: ((1 - newStats.size / originalStats.size) * 100).toFixed(2),
            originalColorSpace: 'cmyk',
            targetColorSpace: 'cmyk',
            method: 'Sharp + ImageMagick (CMYK filigran)'
          };
          
        } catch (error) {
          console.error('❌ CMYK filigran hatası:', error);
          // Temp dosyayı temizle
          if (require('fs').existsSync(tempFilePath)) {
            require('fs').unlinkSync(tempFilePath);
          }
          throw error;
        }
      }
      
      // RGB dosyalara watermark: Tek aşamalı, doğrudan Sharp
      console.log('📌 RGB dosya - Sharp ile filigran ekleniyor');
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
      
      image = image.composite([{
        input: watermarkSVG,
        top: 0,
        left: 0
      }]);
      
      // RGB filigran: Orijinal quality'yi kullan (gereksiz boyut artışını önle)
      // finalQuality zaten quality'ye eşit (satır 757)
      console.log('✓ Filigran eklendi - orijinal kalite korunuyor');
    }

    // Dosya boyutu hedefi varsa Worker Thread'de binary search yap
    if (targetSize && targetSize > 0) {
      console.log(`🎯 TargetSize aktif (${targetSize} KB) - Worker thread'e yönlendiriliyor...`);
      
      // CMYK dosyaysa önce RGB'ye çevir (ImageMagick ile mükemmel kalite)
      let workerInputPath = inputPath;
      let tempFilePath = null;
      
      if (metadata.space === 'cmyk' && imageMagickAvailable) {
        console.log('🎨 CMYK dosya tespit edildi - önce RGB\'ye dönüştürülüyor (ImageMagick)');
        
        // Geçici dosya oluştur
        const tempDir = require('os').tmpdir();
        const tempFileName = `temp_rgb_${Date.now()}.${outputFormat}`;
        tempFilePath = require('path').join(tempDir, tempFileName);
        
        try {
          // ImageMagick ile CMYK→RGB (quality=100, sıkıştırma yok)
          // TargetSize worker'da binary search yapacak, burada maksimum kalite kullan
          await convertWithImageMagick(inputPath, tempFilePath, outputFormat, 100, 'srgb', null);
          console.log('✓ CMYK→RGB dönüşümü tamamlandı (temp file, quality=100)');
          
          // Worker'a RGB dosyayı gönder
          workerInputPath = tempFilePath;
          
          // Temp file metadata'sını güncelle
          const tempImage = sharp(tempFilePath);
          const tempMetadata = await tempImage.metadata();
          metadata.space = tempMetadata.space;
          
        } catch (error) {
          console.error('ImageMagick CMYK→RGB hatası:', error);
          // Temp file temizle
          if (tempFilePath && require('fs').existsSync(tempFilePath)) {
            require('fs').unlinkSync(tempFilePath);
          }
          throw error;
        }
      }
      
      // Orijinal dosya boyutunu al (CMYK→RGB dönüşümü varsa orijinal CMYK dosyanın boyutu)
      const originalStats = await fs.stat(inputPath);
      const originalFileSize = originalStats.size;
      
      // Worker'a gönderilecek task - sanitize edilmiş (structured clone için)
      // Sharp metadata objesi getter/setter içerebilir, sadece primitive değerleri al
      const workerTask = {
        inputPath: workerInputPath,
        outputPath,
        outputFormat,
        targetSize,
        quality: finalQuality, // Kullanıcının seçtiği quality değeri
        originalFileSize, // Orijinal dosya boyutu (CMYK→RGB dönüşümünde temp file değil, orijinal boyut)
        // Sadece Worker'ın ihtiyaç duyduğu metadata özelliklerini gönder
        // NOT: CMYK dosyalar zaten RGB'ye çevrilmiş (ImageMagick ile)
        metadata: {
          space: metadata.space,
          width: metadata.width,
          height: metadata.height
        },
        preserveMetadata,
        // Watermark primitive değerleri gönder
        watermark: watermark ? {
          enabled: watermark.enabled,
          text: watermark.text,
          position: watermark.position,
          opacity: watermark.opacity,
          fontSizePercent: watermark.fontSizePercent,
          color: watermark.color,
          fontFamily: watermark.fontFamily,
          shadow: watermark.shadow,
          tileEnabled: watermark.tileEnabled,
          tilePattern: watermark.tilePattern
        } : null
      };
      
      try {
        const result = await workerPool.executeTask(workerTask);
        
        // Temp file temizle (silme başarısız olsa bile result döndür)
        if (tempFilePath && require('fs').existsSync(tempFilePath)) {
          try {
            require('fs').unlinkSync(tempFilePath);
            console.log('✓ Temp file temizlendi');
          } catch (cleanupError) {
            console.warn('⚠️ Temp file silinemedi (sorun değil):', cleanupError.message);
          }
        }
        
        return result;
      } catch (error) {
        console.error('❌ Worker thread hatası:', error);
        
        // Hata durumunda da temp file temizle (silme başarısız olsa bile hatayı throw et)
        if (tempFilePath && require('fs').existsSync(tempFilePath)) {
          try {
            require('fs').unlinkSync(tempFilePath);
          } catch (cleanupError) {
            console.warn('⚠️ Temp file silinemedi (hata sonrası):', cleanupError.message);
          }
        }
        
        throw error;
      }
    } else {
      // Normal dönüşüm (hedef boyut yok)
      // format değişkeni yukarıda tanımlandı
      
      // Kaynak renk uzayını bildir
      console.log('--- Renk Uzayı Bilgisi ---');
      console.log('Kaynak dosya renk uzayı:', metadata.space);
      console.log('Hedef format:', format.toUpperCase());
      console.log('convertColorSpace parametresi:', convertColorSpace);
      
      // Not: CMYK dönüşümleri yukarıda ImageMagick ile yapıldı
      // Bu noktaya sadece watermark varsa veya RGB/diğer dönüşümlerde geliniyor
      
      // Kaynak zaten CMYK ise ve format destekliyorsa, metadata ile koruyacağız
      if (metadata.space === 'cmyk' && ['jpeg', 'jpg', 'tiff', 'tif'].includes(format)) {
        console.log('✓ Kaynak zaten CMYK - renk uzayı metadata ile korunacak');
      }
      
      switch (format) {
        case 'jpeg':
        case 'jpg':
          const jpegOptions = { 
            quality: finalQuality, 
            progressive: true, 
            mozjpeg: true,
            chromaSubsampling: '4:4:4', // Tam renk kalitesi
            optimiseCoding: true,
            trellisQuantisation: true
          };
          
          // Metadata'yı her durumda koru (renk uzayını korumak için)
          // Watermark eklendiyse zaten quality 100 oldu
          image = image.withMetadata();
          console.log('JPEG: Metadata korunuyor (renk uzayı dahil)');
          
          image = image.jpeg(jpegOptions);
          break;
          
        case 'png':
          // PNG compression: Watermark varsa sabit 6 (orta seviye), yoksa quality'ye göre
          // Quality 100 → compressionLevel 0 olurdu (sıkıştırma yok!), bunu önle
          const compressionLevel = (watermark && watermark.enabled) 
            ? 6 
            : Math.min(Math.round((100 - finalQuality) / 10), 6);
          
          // Metadata'yı koru (ama PNG CMYK desteklemez)
          image = image.withMetadata();
          if (metadata.space === 'cmyk') {
            console.log('PNG: CMYK desteklenmez, RGB\'ye dönüştürülecek');
          } else {
            console.log('PNG: Metadata korunuyor');
          }
          
          image = image.png({ compressionLevel, progressive: true });
          console.log(`PNG compression level: ${compressionLevel}`);
          break;
          
        case 'webp':
          // Metadata'yı koru (ama WebP CMYK desteklemez)
          image = image.withMetadata();
          if (metadata.space === 'cmyk') {
            console.log('WebP: CMYK desteklenmez, RGB\'ye dönüştürülecek');
          } else {
            console.log('WebP: Metadata korunuyor');
          }
          
          image = image.webp({ 
            quality: finalQuality, 
            lossless: false,  // Lossless mode devre dışı (quality 100 bile olsa lossy kullan)
            smartSubsample: true,     // Daha iyi renk koruması
            effort: 4                 // Dengelenmiş (0=hızlı, 6=küçük)
          });
          break;
          
        case 'avif':
          // Metadata'yı koru (ama AVIF CMYK desteklemez)
          image = image.withMetadata();
          if (metadata.space === 'cmyk') {
            console.log('AVIF: CMYK desteklenmez, RGB\'ye dönüştürülecek');
          } else {
            console.log('AVIF: Metadata korunuyor');
          }
          
          image = image.avif({ 
            quality: finalQuality, 
            effort: 4,              // 0-9, yüksek değer = daha iyi sıkıştırma
            chromaSubsampling: '4:4:4' // Maksimum renk kalitesi
          });
          break;
          
        case 'tiff':
        case 'tif':
          const tiffOptions = { quality: finalQuality, compression: 'lzw' };
          
          // Metadata'yı her durumda koru (renk uzayını korumak için)
          image = image.withMetadata();
          console.log('TIFF: Metadata korunuyor (renk uzayı dahil)');
          
          image = image.tiff(tiffOptions);
          break;
          
        case 'bmp':
          // BMP çok temel bir format, metadata desteklemez
          if (metadata.space === 'cmyk') {
            console.log('BMP: CMYK desteklenmez, RGB\'ye dönüştürülecek');
          }
          image = image.bmp();
          break;
          
        default:
          throw new Error(`Desteklenmeyen format: ${outputFormat}`);
      }
      
      const info = await image.toFile(outputPath);
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Bellek temizleme (işlem bittikten sonra)
      clearSharpCache();
      
      return {
        success: true,
        outputPath,
        originalSize: originalSize,
        newSize: info.size,
        compressionRatio: ((1 - info.size / originalSize) * 100).toFixed(2),
        width: info.width,
        height: info.height,
        format: outputFormat,
        originalColorSpace: originalColorSpace,
        targetColorSpace: targetColorSpace,
        wasRenamed // Dosya adı numaralandırıldı mı?
      };
    }
  } catch (error) {
    console.error('Dönüştürme hatası:', error);
    
    // Hata durumunda da bellek temizle
    clearSharpCache();
    
    return {
      success: false,
      error: error.message
    };
  }
});

// Toplu dönüştürme (PARALELLEŞTİRİLMİŞ ⚡)
ipcMain.handle('image:batchConvert', async (event, batchOptions) => {
  const { files, options, outputFolder } = batchOptions;
  const results = [];
  const BATCH_SIZE = 4; // Aynı anda 4 dosya işle (CPU core sayısına göre ayarlanabilir)
  
  let completedCount = 0;

  // Dosyaları BATCH_SIZE'lık gruplara böl ve paralel işle
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    
    // Bu grupdaki tüm dosyaları aynı anda işle
    const batchPromises = batch.map(async (file, batchIndex) => {
      const fileIndexInTotal = i + batchIndex; // Toplam sıra
      
      // Dosya adını belirle (Bulk Rename varsa kullan)
      let outputFileName;
      if (options.bulkRename && options.bulkRename.enabled) {
        outputFileName = generateBulkFileName(
          options.bulkRename.pattern || '{original}-{number}',
          fileIndexInTotal,
          file.name,
          options.bulkRename.startNumber || 1,
          options.bulkRename.padding || 3,
          options.outputFormat
        );
      } else {
        outputFileName = `${path.parse(file.name).name}.${options.outputFormat}`;
      }
      
      const outputPath = path.join(outputFolder, outputFileName);

      try {
        const result = await ipcMain.invokeInternally(
          mainWindow.webContents,
          'image:convert',
          {
            inputPath: file.path,
            outputPath,
            ...options
          }
        );

        completedCount++;
        
        // İlerleme bildirimi gönder
        mainWindow.webContents.send('batch-progress', {
          current: completedCount,
          total: files.length,
          fileName: file.name
        });

        return {
          fileName: file.name,
          ...result
        };
      } catch (error) {
        completedCount++;
        
        mainWindow.webContents.send('batch-progress', {
          current: completedCount,
          total: files.length,
          fileName: file.name
        });

        return {
          fileName: file.name,
          success: false,
          error: error.message
        };
      }
    });

    // Bu grubu bekle, sonra sonraki gruba geç
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  // Batch işlem tamamlandı, progress bar'ı kaldır
  if (mainWindow) {
    mainWindow.setProgressBar(-1);
  }

  return results;
});

// Lisans kontrolü
ipcMain.handle('license:check', async () => {
  const licenseKey = store.get('licenseKey');
  const licenseExpiry = store.get('licenseExpiry');
  const usageCount = store.get('usageCount', 0);
  
  // TEST MODU: Ücretsiz sınır kaldırıldı (Geliştirme için)
  const freeLimit = 999999; // ← Sınırsız kullanım
  
  return {
    hasLicense: !!licenseKey,
    isActive: licenseExpiry && new Date(licenseExpiry) > new Date(),
    usageCount,
    freeLimit,
    canUse: true // ← Her zaman kullanılabilir (Test modu)
  };
});

// Kullanım sayacını artır
ipcMain.handle('license:incrementUsage', async () => {
  const currentCount = store.get('usageCount', 0);
  store.set('usageCount', currentCount + 1);
  return currentCount + 1;
});

// Lisans kaydet
ipcMain.handle('license:activate', async (event, licenseData) => {
  // Bu kısımda gerçek bir lisans doğrulama servisi olmalı
  const { licenseKey, expiryDate } = licenseData;
  
  store.set('licenseKey', licenseKey);
  store.set('licenseExpiry', expiryDate);
  store.set('activatedAt', new Date().toISOString());
  
  return { success: true };
});

// Helper: Internal IPC çağrısı için
ipcMain.invokeInternally = (webContents, channel, ...args) => {
  return new Promise((resolve, reject) => {
    const handler = ipcMain._events[channel] || ipcMain._events[channel]?.[0];
    if (!handler) {
      reject(new Error(`Handler not found for ${channel}`));
      return;
    }
    
    const event = { sender: webContents };
    handler(event, ...args).then(resolve).catch(reject);
  });
};

// Uygulama bilgileri
ipcMain.handle('app:getInfo', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  };
});

// Preview için görsel data URL'i (Worker Thread + Cache)
ipcMain.handle('image:getPreviewData', async (event, filePath) => {
  try {
    // Cache key: dosya yolu + modification time
    const stats = await fs.stat(filePath);
    const cacheKey = `${filePath}_${stats.mtimeMs}`;
    
    // Cache'de varsa direkt döndür (~90% hızlanma)
    if (thumbnailCache.has(cacheKey)) {
      console.log('📸 Thumbnail cache hit:', path.basename(filePath));
      return thumbnailCache.get(cacheKey);
    }
    
    console.log('🎯 Thumbnail Worker Thread\'e yönlendiriliyor:', path.basename(filePath));
    
    // Worker Thread'de thumbnail oluştur
    const workerTask = {
      type: 'generate-thumbnail',
      inputPath: filePath,
      maxWidth: 400,    // Preview için yeterli
      maxHeight: 300
    };
    
    const result = await workerPool.executeTask(workerTask);
    
    // Cache'le
    thumbnailCache.set(cacheKey, result.base64);
    
    // Cache boyut kontrolü (FIFO eviction)
    if (thumbnailCache.size > MAX_THUMBNAIL_CACHE_SIZE) {
      const firstKey = thumbnailCache.keys().next().value;
      thumbnailCache.delete(firstKey);
      console.log('🗑️ Cache overflow - en eski thumbnail silindi');
    }
    
    console.log(`✓ Thumbnail oluşturuldu: ${(result.size / 1024).toFixed(1)} KB (Cache: ${thumbnailCache.size}/${MAX_THUMBNAIL_CACHE_SIZE})`);
    
    return result.base64;
    
  } catch (error) {
    console.error('Preview data oluşturma hatası:', error);
    throw error;
  }
});
