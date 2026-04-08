import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Check } from 'lucide-react';

const CTASection = ({ onGetStarted }) => {
  const { t } = useLanguage();

  const benefits = [
    'benefit1',
    'benefit2',
    'benefit3',
    'benefit4'
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 backdrop-blur-sm border border-primary-500/20 rounded-3xl p-12 md:p-16 text-center">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t('landing.cta.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-700 text-base mb-8 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200"
              >
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-700 text-sm">
                  {t(`landing.cta.${benefit}`)}
                </span>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-6 text-gray-600 text-sm">
            {t('landing.cta.trustBadge')}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

