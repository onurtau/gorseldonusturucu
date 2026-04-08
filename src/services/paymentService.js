/**
 * Payment Service
 * Handles Stripe checkout and subscription management
 */

import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class PaymentService {
  /**
   * Create Stripe checkout session
   * @param {string} userId - User ID from Supabase
   * @param {string} userEmail - User email
   * @returns {Promise<Object>} Checkout session data
   */
  async createCheckoutSession(userId, userEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Checkout session error:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe checkout
   * @param {string} userId - User ID
   * @param {string} userEmail - User email
   */
  async redirectToCheckout(userId, userEmail) {
    try {
      const session = await this.createCheckoutSession(userId, userEmail);
      
      if (session.url) {
        // Redirect to Stripe checkout page
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Redirect to checkout error:', error);
      throw error;
    }
  }

  /**
   * Verify payment after successful checkout
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<Object>} Subscription data
   */
  async verifyPayment(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }

      const data = await response.json();
      
      // Update user license in Supabase
      if (data.success && data.subscription) {
        await this.updateUserLicense(data.userId, data.subscription);
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Update user license in Supabase
   * @param {string} userId - User ID
   * @param {Object} subscription - Subscription data
   */
  async updateUserLicense(userId, subscription) {
    try {
      const { error } = await supabase
        .from('user_licenses')
        .upsert({
          user_id: userId,
          license_type: 'premium',
          license_key: subscription.id,
          expires_at: subscription.currentPeriodEnd,
          is_active: subscription.status === 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('License update error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Update user license error:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw error;
      }

      if (!data) {
        return {
          isPremium: false,
          expiresAt: null,
          isActive: false
        };
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const isActive = data.is_active && expiresAt > now;

      return {
        isPremium: isActive,
        expiresAt: data.expires_at,
        isActive: data.is_active,
        licenseType: data.license_type
      };
    } catch (error) {
      console.error('Get subscription status error:', error);
      return {
        isPremium: false,
        expiresAt: null,
        isActive: false
      };
    }
  }
}

// Export singleton instance
export default new PaymentService();
