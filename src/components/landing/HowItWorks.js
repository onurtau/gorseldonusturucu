import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Upload, Settings, Download } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: Upload,
      titleKey: 'step1Title',
      descKey: 'step1Desc',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: 2,
      icon: Settings,
      titleKey: 'step2Title',
      descKey: 'step2Desc',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: 3,
      icon: Download,
      titleKey: 'step3Title',
      descKey: 'step3Desc',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-8 sm:py-20 px-2 sm:px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step card */}
                <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-8 hover:border-primary-500/50 transition-all duration-300 hover:scale-105">
                  {/* Number badge */}
                  <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} p-3 mb-6 mx-auto`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-gray-900 font-semibold text-xl mb-3 text-center">
                    {t(`landing.howItWorks.${step.titleKey}`)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-center">
                    {t(`landing.howItWorks.${step.descKey}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('landing.howItWorks.bottomText')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

