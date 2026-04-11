import React, { useState } from 'react';
import { X, Crown, Check, CreditCard, Shield } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';

const LicenseModal = () => {
  const { t } = useLanguage();
  const { toggleLicenseModal, addNotification, setLicense, setActiveView } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: t('license.monthly'),
      price: '49.99',
      period: t('license.perMonth'),
      features: [
        t('license.features.unlimited'),
        t('license.features.allFormats'),
        t('license.features.cmykRgb'),
        t('license.features.bulkProcess'),
        t('license.features.prioritySupport'),
        t('license.features.autoUpdate')
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: t('license.yearly'),
      price: '399.99',
      period: t('license.perYear'),
      savings: t('license.savings'),
      features: [
        t('license.features.unlimited'),
        t('license.features.allFormats'),
        t('license.features.cmykRgb'),
        t('license.features.bulkProcess'),
        t('license.features.prioritySupport'),
        t('license.features.autoUpdate'),
        t('license.features.twoMonthsFree'),
        t('license.features.futureFeatures')
      ],
      popular: true
    }
  ];

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Gerçek uygulamada burada Stripe veya başka bir ödeme sistemi entegrasyonu yapılacak
    // Şimdi demo amaçlı simüle ediyoruz
    
    setTimeout(() => {
      // Demo lisans aktivasyonu
      const expiryDate = new Date();
      if (selectedPlan === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      setLicense({
        hasLicense: true,
        isActive: true,
        usageCount: 0,
        freeLimit: 5,
        canUse: true
      });

      if (window.electronAPI?.activateLicense) {
        window.electronAPI.activateLicense({
          licenseKey: `DEMO-${Date.now()}`,
          expiryDate: expiryDate.toISOString()
        });
      }

      addNotification({
        type: 'success',
        title: t('license.activated'),
        message: t('license.enjoyPremium')
      });

      setIsProcessing(false);
      toggleLicenseModal();
    }, 2000);
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      // Authenticated kullanıcılar için modal kapat ve terms view'ına git
      toggleLicenseModal();
      setActiveView('terms');
    } else {
      // Public kullanıcılar için hash navigation kullan
      window.location.hash = 'terms';
      toggleLicenseModal();
    }
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      // Authenticated kullanıcılar için modal kapat ve privacy view'ına git
      toggleLicenseModal();
      setActiveView('privacy');
    } else {
      // Public kullanıcılar için hash navigation kullan
      window.location.hash = 'privacy';
      toggleLicenseModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-dark-700">
        {/* Başlık */}
        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('license.title')}</h2>
              <p className="text-gray-400">{t('license.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={toggleLicenseModal}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Plan Seçimi */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all card-hover
                  ${selectedPlan === plan.id
                    ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                    : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                  }
                  ${plan.popular ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('license.mostPopular')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold gradient-text">₺{plan.price}</span>
                    <span className="text-gray-400">/ {plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span className="inline-block mt-2 bg-green-500 bg-opacity-20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`
                  w-6 h-6 rounded-full border-2 mx-auto
                  ${selectedPlan === plan.id
                    ? 'border-primary-500 bg-primary-500 flex items-center justify-center'
                    : 'border-dark-500'
                  }
                `}>
                  {selectedPlan === plan.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ödeme Bilgileri */}
          <div className="bg-dark-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">{t('license.paymentInfo')}</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder={t('license.cardNumber')}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('license.expiryDate')}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder={t('license.cvv')}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <input
                type="text"
                placeholder={t('license.cardHolderName')}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Güvenlik Notu */}
            <div className="flex items-start gap-2 text-sm text-gray-400 bg-dark-800 p-3 rounded-lg">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
              <p>
                {t('license.securityNote')}
              </p>
            </div>
          </div>

          {/* Satın Al Butonu */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${isProcessing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white btn-hover-scale'
              }
            `}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                {t('license.processing')}
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                {t('license.purchaseNow')} - ₺{plans.find(p => p.id === selectedPlan)?.price}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            {t('license.agreeText')}{' '}
            <a href="#terms" onClick={handleTermsClick} className="text-primary-400 hover:underline">
              {t('license.termsAndConditions')}
            </a>{' '}
            {t('license.and')}{' '}
            <a href="#privacy" onClick={handlePrivacyClick} className="text-primary-400 hover:underline">
              {t('license.privacyPolicy')}
            </a>{' '}
            {t('license.acceptText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;
