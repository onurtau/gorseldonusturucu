/**
 * Trial Management Service
 * 
 * Web versiyonunda kayıt olmayan kullanıcılar için deneme sistemi.
 * localStorage kullanarak haftalık 10 dönüşüm ücretsiz sağlar.
 */

const TRIAL_KEY = 'gorsel_donusturucu_trial';
const MAX_TRIAL_COUNT = 50;

/**
 * Deneme verisini localStorage'dan al
 * @returns {Object} { count: number, timestamp: number }
 */
const getTrialData = () => {
  try {
    const data = localStorage.getItem(TRIAL_KEY);
    if (!data) {
      return { count: 0, timestamp: Date.now() };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Trial data okuma hatası:', error);
    return { count: 0, timestamp: Date.now() };
  }
};

/**
 * Deneme verisini localStorage'a kaydet
 * @param {Object} data - { count: number, timestamp: number }
 */
const saveTrialData = (data) => {
  try {
    localStorage.setItem(TRIAL_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Trial data kaydetme hatası:', error);
  }
};

/**
 * Kullanıcının deneme hakkı var mı kontrol et
 * @param {Object} user - Supabase kullanıcı objesi (null ise kayıt olmamış)
 * @param {Object} license - Lisans bilgisi
 * @returns {boolean} Deneme hakkı var mı?
 */
export const canUseTrial = (user, license) => {
  // Kullanıcı kayıtlı ve premium ise -> sınırsız
  if (user && license?.isPremium) {
    return true;
  }

  // Kullanıcı kayıtlı ama premium değilse -> license.canUse kontrolü
  if (user) {
    return license?.canUse || false;
  }

  // Kullanıcı kayıtsız -> deneme sayısını kontrol et
  const trialData = getTrialData();
  return trialData.count < MAX_TRIAL_COUNT;
};

/**
 * Deneme kullanımını artır
 * @param {Object} user - Supabase kullanıcı objesi
 * @returns {number} Kalan deneme hakkı
 */
export const incrementTrialUsage = (user) => {
  // Sadece kayıtsız kullanıcılar için
  if (user) {
    return MAX_TRIAL_COUNT; // Kayıtlı kullanıcılar için trial sayacı kullanılmaz
  }

  const trialData = getTrialData();
  trialData.count++;
  trialData.timestamp = Date.now();
  saveTrialData(trialData);

  return MAX_TRIAL_COUNT - trialData.count;
};

/**
 * Kalan deneme hakkını al
 * @param {Object} user - Supabase kullanıcı objesi
 * @returns {number} Kalan deneme hakkı
 */
export const getRemainingTrials = (user) => {
  // Web'de sınırsız
  return Infinity;
};

/**
 * Deneme verilerini sıfırla (test için)
 */
export const resetTrial = () => {
  localStorage.removeItem(TRIAL_KEY);
};

/**
 * Deneme limiti doldu mu?
 * @param {Object} user - Supabase kullanıcı objesi
 * @returns {boolean} Limit doldu mu?
 */
export const isTrialExpired = (user) => {
  if (user) {
    return false; // Kayıtlı kullanıcılar için trial expire olmaz
  }

  const remaining = getRemainingTrials(user);
  return remaining === 0;
};

/**
 * Platform ve kullanıcı durumuna göre kullanım kontrolü
 * @param {boolean} isElectron - Electron platformu mu?
 * @param {Object} user - Supabase kullanıcı objesi
 * @param {Object} license - Lisans bilgisi
 * @returns {Object} { canUse: boolean, reason: string, remaining: number }
 */
export const checkUsagePermission = (isElectron, user, license) => {
  console.log('[checkUsagePermission] isElectron:', isElectron, 'user:', user, 'license:', license);
  
  // Electron: Mevcut license sistemi kullanılır
  if (isElectron) {
    return {
      canUse: license?.canUse || false,
      reason: license?.canUse ? 'license' : 'license-limit',
      remaining: license?.remaining || 0
    };
  }

  // WEB: Sınırsız erişim (test için)
  console.log('[checkUsagePermission] Web mode: unlimited access');
  return {
    canUse: true,
    reason: 'web-unlimited',
    remaining: Infinity
  };
};

export default {
  canUseTrial,
  incrementTrialUsage,
  getRemainingTrials,
  resetTrial,
  isTrialExpired,
  checkUsagePermission,
  MAX_TRIAL_COUNT
};
