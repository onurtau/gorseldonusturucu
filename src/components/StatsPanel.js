import React from 'react';
import { BarChart3, HardDrive, Percent, TrendingUp } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

const StatsPanel = React.memo(() => {
  const { t } = useLanguage();
  const { stats } = useAppStore();

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statItems = [
    {
      icon: BarChart3,
      label: t('stats.totalConversions'),
      value: stats.totalConverted,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500'
    },
    {
      icon: HardDrive,
      label: t('stats.sizeSaved'),
      value: formatFileSize(stats.totalSizeSaved),
      color: 'text-green-400',
      bgColor: 'bg-green-500'
    },
    {
      icon: Percent,
      label: t('stats.avgCompression'),
      value: `${stats.averageCompressionRatio.toFixed(1)}%`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      {/* Başlık */}
      <div className="p-4 border-b border-dark-700 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">{t('stats.title')}</h3>
      </div>

      <div className="p-4 space-y-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <div className={`p-2 ${item.bgColor} bg-opacity-20 rounded-lg`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}

        {stats.totalConverted === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('stats.noConversions')}</p>
          </div>
        )}
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';

export default StatsPanel;
