import React from 'react';
import { FileImage, Minimize2, Palette, FileType, Layers } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ToolsSection = ({ navigateTo }) => {
  const { t } = useLanguage();

  const tools = [
    {
      id: 'format-conversion',
      titleKey: 'formatConversion.title',
      descKey: 'formatConversion.description',
      featuresKey: 'formatConversion',
      icon: FileImage,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'resize',
      titleKey: 'resize.title',
      descKey: 'resize.description',
      featuresKey: 'resize',
      icon: Minimize2,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'colorspace',
      titleKey: 'colorspace.title',
      descKey: 'colorspace.description',
      featuresKey: 'colorspace',
      icon: Palette,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'watermark',
      titleKey: 'watermark.title',
      descKey: 'watermark.description',
      featuresKey: 'watermark',
      icon: FileType,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'all-in-one',
      titleKey: 'allInOne.title',
      descKey: 'allInOne.description',
      featuresKey: 'allInOne',
      icon: Layers,
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="py-8 sm:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.tools.title')}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('landing.tools.subtitle')}
          </p>
        </div>

        {/* Tools Grid - 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => navigateTo(tool.id)}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 text-left border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2"
              >
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                  {t(`landing.tools.${tool.titleKey}`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {t(`landing.tools.${tool.descKey}`)}
                </p>

                {/* Features */}
                <ul className="space-y-1">
                  <li className="text-xs text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                    {t(`landing.tools.${tool.featuresKey}.feature1`)}
                  </li>
                  <li className="text-xs text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                    {t(`landing.tools.${tool.featuresKey}.feature2`)}
                  </li>
                  <li className="text-xs text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                    {t(`landing.tools.${tool.featuresKey}.feature3`)}
                  </li>
                </ul>

                {/* Hover indicator */}
                <div className="mt-4 text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('landing.tools.startNow')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Trial Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-900">
              {t('landing.tools.trialInfo')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
