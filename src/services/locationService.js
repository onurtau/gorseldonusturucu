/**
 * Location Detection Service
 * Detects user's region for pricing
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class LocationService {
  constructor() {
    this.cachedLocation = null;
  }

  /**
   * Detect user's location and pricing
   * @returns {Promise<Object>} Location and pricing info
   */
  async detectLocation() {
    // Return cached result if available
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/detect-location`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();
      
      // Cache the result
      this.cachedLocation = {
        region: data.region,
        pricing: data.pricing,
        ip: data.ip
      };

      return this.cachedLocation;
    } catch (error) {
      console.error('Location detection error:', error);
      
      // Fallback to default pricing (USD $3)
      return {
        region: 'global',
        pricing: {
          amount: '3',
          currency: 'usd',
          symbol: '$',
          formatted: '$3'
        },
        ip: 'unknown'
      };
    }
  }

  /**
   * Get cached location or detect if not cached
   * @returns {Promise<Object>}
   */
  async getLocation() {
    return this.cachedLocation || this.detectLocation();
  }

  /**
   * Clear cached location
   */
  clearCache() {
    this.cachedLocation = null;
  }

  /**
   * Get pricing display text
   * @returns {Promise<string>}
   */
  async getPricingText() {
    const location = await this.getLocation();
    return location.pricing.formatted;
  }

  /**
   * Get region name
   * @returns {Promise<string>}
   */
  async getRegion() {
    const location = await this.getLocation();
    return location.region;
  }
}

// Export singleton instance
export default new LocationService();
