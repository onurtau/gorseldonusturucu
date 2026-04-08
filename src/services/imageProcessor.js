/**
 * Image Processing Abstraction Layer
 * 
 * Bu servis Electron desktop ve web browser arasında platform-agnostic
 * bir arayüz sağlar. Otomatik olarak platforma göre doğru işlemi kullanır.
 */

// Platform detection
export const isElectron = typeof window !== 'undefined' && 
                          window.electronAPI !== undefined;

// API base URL (web için)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('[imageProcessor] Platform:', isElectron ? 'Electron' : 'Web');
console.log('[imageProcessor] API Base URL:', API_BASE_URL);

/**
 * Format dönüştürme - Platform agnostic
 * @param {File|string} file - Dosya objesi veya path
 * @param {Object} options - Dönüştürme seçenekleri
 * @returns {Promise<Blob|Buffer>} İşlenmiş dosya
 */
export const convertImage = async (file, options) => {
  console.log('[convertImage] Called with file:', file, 'options:', options);
  
  if (isElectron) {
    // Electron desktop kullan
    return await window.electronAPI.convertFormat(file, options);
  } else {
    // Web API kullan
    console.log('[convertImage] Using web API, creating FormData...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const url = `${API_BASE_URL}/api/convert`;
    console.log('[convertImage] Fetching:', url);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    console.log('[convertImage] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('[convertImage] API Error:', error);
      throw new Error(error.error || 'Conversion failed');
    }

    const blob = await response.blob();
    console.log('[convertImage] Received blob, size:', blob.size);
    return blob;
  }
};

/**
 * Görsel boyutlandırma - Platform agnostic
 * @param {File|string} file - Dosya objesi veya path
 * @param {Object} options - Boyutlandırma seçenekleri
 * @returns {Promise<Blob|Buffer>} İşlenmiş dosya
 */
export const resizeImage = async (file, options) => {
  if (isElectron) {
    // Electron desktop kullan
    return await window.electronAPI.resizeImage(file, options);
  } else {
    // Web API kullan
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await fetch(`${API_BASE_URL}/api/resize`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Resize failed');
    }

    return await response.blob();
  }
};

/**
 * Filigran ekleme - Platform agnostic
 * @param {File|string} file - Ana dosya
 * @param {Object} options - Filigran seçenekleri
 * @param {File|string} watermarkFile - Filigran dosyası (opsiyonel)
 * @returns {Promise<Blob|Buffer>} İşlenmiş dosya
 */
export const addWatermark = async (file, options, watermarkFile = null) => {
  if (isElectron) {
    // Electron desktop kullan
    return await window.electronAPI.addWatermark(file, options, watermarkFile);
  } else {
    // Web API kullan
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    
    if (watermarkFile) {
      formData.append('watermark', watermarkFile);
    }

    const response = await fetch(`${API_BASE_URL}/api/watermark`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Watermark failed');
    }

    return await response.blob();
  }
};

/**
 * Renk uzayı dönüştürme - Platform agnostic
 * @param {File|string} file - Dosya objesi veya path
 * @param {Object} options - Renk uzayı seçenekleri
 * @returns {Promise<Blob|Buffer>} İşlenmiş dosya
 */
export const convertColorSpace = async (file, options) => {
  if (isElectron) {
    // Electron desktop kullan
    return await window.electronAPI.convertColorSpace(file, options);
  } else {
    // Web API kullan
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await fetch(`${API_BASE_URL}/api/colorspace`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Colorspace conversion failed');
    }

    return await response.blob();
  }
};

/**
 * Toplu işleme - Platform agnostic
 * @param {Array<File|string>} files - Dosya listesi
 * @param {Object} options - İşlem seçenekleri
 * @param {Function} progressCallback - İlerleme callback (opsiyonel)
 * @returns {Promise<Array>} İşlenmiş dosyalar
 */
export const batchProcess = async (files, options, progressCallback = null) => {
  if (isElectron) {
    // Electron desktop kullan
    return await window.electronAPI.batchProcess(files, options, progressCallback);
  } else {
    // Web API kullan
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('options', JSON.stringify(options));

    const response = await fetch(`${API_BASE_URL}/api/batch`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Batch processing failed');
    }

    const result = await response.json();
    return result.results;
  }
};

/**
 * Platform kontrolü
 * @returns {string} 'electron' veya 'web'
 */
export const getPlatform = () => {
  return isElectron ? 'electron' : 'web';
};

/**
 * Platform özelliklerine göre dosya indirme
 * @param {Blob} blob - İndirilecek blob
 * @param {string} filename - Dosya adı
 */
export const downloadFile = (blob, filename) => {
  if (isElectron) {
    // Electron'da electronAPI download metodunu kullan
    // (Bu metod henüz yoksa eklenmeli)
    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = Buffer.from(reader.result);
      await window.electronAPI.saveFile(buffer, filename);
    };
    reader.readAsArrayBuffer(blob);
  } else {
    // Web browser için standart download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * API sağlık kontrolü (sadece web)
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkAPIHealth = async () => {
  if (isElectron) {
    return true; // Electron'da API kontrolü gerekmez
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default {
  convertImage,
  resizeImage,
  addWatermark,
  convertColorSpace,
  batchProcess,
  getPlatform,
  downloadFile,
  checkAPIHealth,
  isElectron
};
