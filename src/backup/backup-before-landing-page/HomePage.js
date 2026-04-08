import React from 'react';
import { FileImage, Minimize2, Palette, Droplet, Zap } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage = () => {
  const { setActiveView } = useAppStore();
  const { t } = useLanguage();

  const features = [
    {
      id: 'format-conversion',
      title: t('home.features.formatConversion.title'),
      description: t('home.features.formatConversion.description'),
      icon: FileImage,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      id: 'resize',
      title: t('home.features.resize.title'),
      description: t('home.features.resize.description'),
      icon: Minimize2,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      id: 'colorspace',
      title: t('home.features.colorspace.title'),
      description: t('home.features.colorspace.description'),
      icon: Palette,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      id: 'watermark',
      title: t('home.features.watermark.title'),
      description: t('home.features.watermark.description'),
      icon: Droplet,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    },
    {
      id: 'multi',
      title: t('home.features.multi.title'),
      description: t('home.features.multi.description'),
      icon: Zap,
      color: 'from-primary-500 to-primary-600',
      hoverColor: 'hover:from-primary-600 hover:to-primary-700',
      iconBg: 'bg-primary-500/20',
      iconColor: 'text-primary-400',
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            {t('home.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-5 text-center">
            {t('home.selectOperation')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveView(feature.id)}
                  className={`
                    relative group
                    bg-dark-800 border border-dark-700 rounded-xl p-4
                    transition-all duration-300
                    hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20
                    hover:scale-102
                    ${feature.featured ? 'md:col-span-2 lg:col-span-3' : ''}
                  `}
                >
                  {/* Featured Badge */}
                  {feature.featured && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ⭐ {t('home.popular')}
                    </div>
                  )}

                  <div className={`flex ${feature.featured ? 'flex-row items-center gap-6' : 'flex-col'}`}>
                    {/* Icon */}
                    <div className={`
                      ${feature.iconBg} 
                      ${feature.featured ? 'w-16 h-16' : 'w-12 h-12'} 
                      rounded-xl flex items-center justify-center mb-3
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className={`
                        ${feature.iconColor} 
                        ${feature.featured ? 'w-8 h-8' : 'w-6 h-6'}
                      `} />
                    </div>

                    {/* Content */}
                    <div className={feature.featured ? 'flex-1 text-left' : 'text-center'}>
                      <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {feature.description}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="mt-3 group-hover:translate-x-1 transition-transform duration-300">
                      <svg 
                        className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <h3 className="text-base font-semibold text-white mb-2">💡 {t('home.tips.title')}</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• {t('home.tips.single')}</li>
              <li>• {t('home.tips.multiple')}</li>
              <li>• {t('home.tips.batch')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
