const { contextBridge, ipcRenderer } = require('electron');

// Renderer process'e güvenli API sağla
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog işlemleri
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  
  // Görüntü işleme
  convertImage: (options) => ipcRenderer.invoke('image:convert', options),
  batchConvert: (batchOptions) => ipcRenderer.invoke('image:batchConvert', batchOptions),
  getPreviewData: (filePath) => ipcRenderer.invoke('image:getPreviewData', filePath),
  
  // Toplu işlem ilerleme dinleyici
  onBatchProgress: (callback) => {
    ipcRenderer.on('batch-progress', (event, data) => callback(data));
  },
  
  // Binary search iteration ilerleme dinleyici
  onIterationProgress: (callback) => {
    ipcRenderer.on('iteration-progress', (event, data) => callback(data));
  },
  
  // Lisans yönetimi
  checkLicense: () => ipcRenderer.invoke('license:check'),
  incrementUsage: () => ipcRenderer.invoke('license:incrementUsage'),
  activateLicense: (licenseData) => ipcRenderer.invoke('license:activate', licenseData),
  
  // Uygulama bilgileri
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  
  // Platform kontrolü
  platform: process.platform
});
