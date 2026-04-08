import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Users, Image, Zap, Star } from 'lucide-react';

const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      valueKey: 'stat1Value',
      labelKey: 'stat1Label',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Image,
      valueKey: 'stat2Value',
      labelKey: 'stat2Label',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      valueKey: 'stat3Value',
      labelKey: 'stat3Label',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Star,
      valueKey: 'stat4Value',
      labelKey: 'stat4Label',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.stats.title')}
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {t('landing.stats.subtitle')}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                
                {/* Value */}
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {t(`landing.stats.${stat.valueKey}`)}
                </div>
                
                {/* Label */}
                <div className="text-gray-600 text-sm">
                  {t(`landing.stats.${stat.labelKey}`)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

