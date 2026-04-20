import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Zap, Shield, Layers, Cloud, Sparkles, Lock, RefreshCw, Download } from 'lucide-react';

const FeaturesGrid = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Zap,
      titleKey: 'feature1Title',
      descKey: 'feature1Desc',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Layers,
      titleKey: 'feature2Title',
      descKey: 'feature2Desc',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      titleKey: 'feature3Title',
      descKey: 'feature3Desc',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Cloud,
      titleKey: 'feature4Title',
      descKey: 'feature4Desc',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Sparkles,
      titleKey: 'feature5Title',
      descKey: 'feature5Desc',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: Lock,
      titleKey: 'feature6Title',
      descKey: 'feature6Desc',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: RefreshCw,
      titleKey: 'feature7Title',
      descKey: 'feature7Desc',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Download,
      titleKey: 'feature8Title',
      descKey: 'feature8Desc',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <section className="py-8 sm:py-20 px-2 sm:px-4 bg-gray-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/10"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
                  {t(`landing.features.${feature.titleKey}`)}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm">
                  {t(`landing.features.${feature.descKey}`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

