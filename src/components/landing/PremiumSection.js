import React, { useState, useEffect } from 'react';
import { Check, Zap, Infinity } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import locationService from '../../services/locationService';
import paymentService from '../../services/paymentService';
import useAuthStore from '../../store/useAuthStore';

const PremiumSection = ({ onUpgrade }) => {
  const { t } = useLanguage();
  const user = useAuthStore(state => state.user);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect user location and pricing
    const detectPricing = async () => {
      try {
        const location = await locationService.detectLocation();
        setPricing(location.pricing);
      } catch (error) {
        console.error('Failed to detect pricing:', error);
        // Fallback to default
        setPricing({
          amount: '3',
          currency: 'usd',
          symbol: '$',
          formatted: '$3'
        });
      } finally {
        setLoading(false);
      }
    };

    detectPricing();
  }, []);

  const handleUpgradeClick = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      if (onUpgrade) {
        onUpgrade();
      }
      return;
    }

    try {
      // Redirect to Stripe checkout
      await paymentService.redirectToCheckout(user.id, user.email);
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert(t('landing.premium.checkoutError') || 'Failed to start checkout. Please try again.');
    }
  };

  // Get display price (use detected pricing or fallback to translation)
  const getPremiumPrice = () => {
    if (loading || !pricing) {
      return t('landing.premium.premiumPrice');
    }
    return pricing.formatted;
  };

  const plans = [
    {
      id: 'free',
      name: t('landing.premium.freePlan'),
      price: t('landing.premium.freePrice'),
      badge: null,
      features: [
        { text: t('landing.premium.weeklyLimit'), included: true, highlight: true },
        { text: t('landing.premium.allFormats'), included: true },
        { text: t('landing.premium.formatConversion'), included: true },
        { text: t('landing.premium.resizeCompress'), included: true },
        { text: t('landing.premium.cmykConversion'), included: true },
        { text: t('landing.premium.watermarkAdd'), included: true },
        { text: t('landing.premium.batchProcessing'), included: true },
        { text: t('landing.premium.qualitySettings'), included: true }
      ]
    },
    {
      id: 'premium',
      name: t('landing.premium.premiumPlan'),
      price: getPremiumPrice(),
      badge: t('landing.premium.popular'),
      features: [
        { text: t('landing.premium.unlimitedOperations'), included: true, highlight: true },
        { text: t('landing.premium.allFormats'), included: true },
        { text: t('landing.premium.allFeatures'), included: true },
        { text: t('landing.premium.formatConversion'), included: true },
        { text: t('landing.premium.resizeCompress'), included: true },
        { text: t('landing.premium.cmykConversion'), included: true },
        { text: t('landing.premium.watermarkAdd'), included: true },
        { text: t('landing.premium.batchProcessing'), included: true },
        { text: t('landing.premium.qualitySettings'), included: true },
        { text: t('landing.premium.prioritySupport'), included: true },
        { text: t('landing.premium.adFree'), included: true },
        { text: t('landing.premium.cloudStorage'), included: true }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.premium.title')}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('landing.premium.subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-8 border-2 transition-all duration-300
                ${plan.id === 'premium' 
                  ? 'bg-gradient-to-br from-primary-500/10 to-purple-500/10 border-primary-500/50 shadow-2xl shadow-primary-500/20 scale-105' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                  ⭐ {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.id === 'premium' && (
                    <Infinity className="w-6 h-6 text-primary-500" />
                  )}
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </div>
                </div>
                {plan.id === 'premium' && (
                  <p className="text-sm text-gray-600">{t('landing.premium.perMonth')}</p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-sm ${feature.highlight ? 'font-bold text-primary-600' : 'text-gray-700'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.id === 'premium' ? (
                <button
                  onClick={handleUpgradeClick}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5" />
                  {loading ? t('landing.premium.loading') || 'Loading...' : t('landing.premium.upgradeButton')}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed"
                >
                  {t('landing.premium.currentPlan')}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            💳 {t('landing.premium.bottomNote')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;

