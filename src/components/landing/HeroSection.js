import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const HeroSection = ({ onGetStarted }) => {
  const { t } = useLanguage();

  const features = [
    t('landing.hero.feature1'),
    t('landing.hero.feature2'),
    t('landing.hero.feature3')
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 max-w-7xl relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {t('landing.hero.title')}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
              {t('landing.hero.titleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <p className="text-gray-600 text-sm mt-8">
            ✨ {t('landing.hero.trustBadge')}
          </p>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default HeroSection;
