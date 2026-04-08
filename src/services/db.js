import Dexie from 'dexie';

/**
 * IndexedDB Database - Offline Support için
 * 
 * Bu database offline modda çalışmayı sağlar.
 * Kullanıcı internet bağlantısı olmasa bile uygulamayı kullanabilir.
 */

class GorselDonusturucuDB extends Dexie {
  constructor() {
    super('GorselDonusturucuDB');
    
    // Database schema tanımla
    this.version(1).stores({
      // Kullanıcı profili (cache)
      userProfile: 'id, email, full_name, avatar_url, updated_at',
      
      // Kullanıcı ayarları (senkronize)
      userSettings: '++id, key, value, updated_at, synced',
      
      // Offline queue (internet gelince sync edilecek işlemler)
      offlineQueue: '++id, timestamp, action, data, synced, retry_count',
      
      // Session bilgileri
      sessions: '++id, device_name, device_type, platform, last_active, is_current',
      
      // Lisans bilgileri (cache)
      license: 'id, license_type, expires_at, is_active',
      
      // Kullanım istatistikleri (local tracking)
      usageStats: '++id, month, conversion_count, last_used',
      
      // Preset'ler (offline erişim için)
      presets: '++id, name, settings, created_at, is_favorite'
    });

    // Tablolara kolay erişim için
    this.userProfile = this.table('userProfile');
    this.userSettings = this.table('userSettings');
    this.offlineQueue = this.table('offlineQueue');
    this.sessions = this.table('sessions');
    this.license = this.table('license');
    this.usageStats = this.table('usageStats');
    this.presets = this.table('presets');
  }

  /**
   * Kullanıcı profilini cache'e kaydet
   */
  async cacheUserProfile(user) {
    if (!user || !user.id) return null;
    return await this.userProfile.put({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Cache'den kullanıcı profilini al
   */
  async getCachedUserProfile(userId) {
    if (!userId) return null;
    return await this.userProfile.get(userId);
  }

  /**
   * Ayarı kaydet
   */
  async saveSetting(key, value, synced = false) {
    return await this.userSettings.put({
      key,
      value,
      updated_at: new Date().toISOString(),
      synced
    });
  }

  /**
   * Ayarı al
   */
  async getSetting(key) {
    const setting = await this.userSettings.where('key').equals(key).first();
    return setting?.value;
  }

  /**
   * Tüm ayarları al
   */
  async getAllSettings() {
    return await this.userSettings.toArray();
  }

  /**
   * Offline queue'ya işlem ekle
   */
  async addToOfflineQueue(action, data) {
    return await this.offlineQueue.add({
      timestamp: new Date().toISOString(),
      action,
      data,
      synced: false,
      retry_count: 0
    });
  }

  /**
   * Offline queue'yu al (senkronize edilmemiş)
   */
  async getOfflineQueue() {
    return await this.offlineQueue.where('synced').equals(false).toArray();
  }

  /**
   * Queue item'ı senkronize edildi olarak işaretle
   */
  async markQueueItemSynced(id) {
    return await this.offlineQueue.update(id, { synced: true });
  }

  /**
   * Queue item'ın retry sayısını artır
   */
  async incrementRetryCount(id) {
    const item = await this.offlineQueue.get(id);
    if (item) {
      return await this.offlineQueue.update(id, { 
        retry_count: (item.retry_count || 0) + 1 
      });
    }
  }

  /**
   * Tüm verileri temizle (logout)
   */
  async clearAllData() {
    await this.userProfile.clear();
    await this.userSettings.clear();
    await this.offlineQueue.clear();
    await this.sessions.clear();
    await this.license.clear();
    await this.usageStats.clear();
    // Presets kullanıcıya özel değilse tutulabilir
  }

  /**
   * Senkronize edilmemiş ayarları al
   */
  async getUnsyncedSettings() {
    return await this.userSettings.where('synced').equals(false).toArray();
  }

  /**
   * Lisans bilgisini cache'e kaydet
   */
  async cacheLicense(licenseData) {
    return await this.license.put({
      id: licenseData.id,
      license_type: licenseData.license_type,
      expires_at: licenseData.expires_at,
      is_active: licenseData.is_active
    });
  }

  /**
   * Cache'den lisans bilgisini al
   */
  async getCachedLicense() {
    const licenses = await this.license.toArray();
    return licenses[0] || null;
  }
}

// Database instance oluştur ve export et
export const db = new GorselDonusturucuDB();

// Database açılış durumunu kontrol et
db.open().catch((error) => {
  console.error('❌ IndexedDB açılamadı:', error);
});

export default db;
