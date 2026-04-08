/**
 * Device Information Utility
 * Cihaz bilgilerini tespit eden yardımcı fonksiyonlar
 */

/**
 * Cihaz tipini tespit et (desktop, mobile, tablet)
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * Platform tespit et (Windows, macOS, Linux, Android, iOS)
 */
export const getPlatform = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  // iOS
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }
  
  // Android
  if (/Android/.test(ua)) {
    return 'Android';
  }
  
  // Windows
  if (/Win/.test(platform)) {
    return 'Windows';
  }
  
  // macOS
  if (/Mac/.test(platform)) {
    return 'macOS';
  }
  
  // Linux
  if (/Linux/.test(platform)) {
    return 'Linux';
  }
  
  return 'Unknown';
};

/**
 * Browser bilgisi al
 */
export const getBrowser = () => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  
  return 'Unknown Browser';
};

/**
 * Cihaz adı oluştur
 */
export const getDeviceName = () => {
  const platform = getPlatform();
  const browser = getBrowser();
  const deviceType = getDeviceType();
  
  // Electron desktop app mı?
  if (window.electron || window.process?.type) {
    return `${platform} Desktop App`;
  }
  
  // Web browser
  if (deviceType === 'desktop') {
    return `${browser} on ${platform}`;
  }
  
  return `${browser} on ${platform} ${deviceType}`;
};

/**
 * Session metadata oluştur
 */
export const getSessionMetadata = () => {
  return {
    device_name: getDeviceName(),
    device_type: getDeviceType(),
    platform: getPlatform(),
    user_agent: navigator.userAgent,
    screen_size: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
