import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import WatermarkPreview from '../components/WatermarkPreview';
import FileUploadZone from '../components/FileUploadZone';
import FileList from '../components/FileList';
import ConversionPanel from '../components/ConversionPanel';
import StatsPanel from '../components/StatsPanel';

const MultiPage = ({ onBackToLanding }) => {
  const { setActiveView } = useAppStore();

  useEffect(() => {
    setActiveView('multi');
  }, [setActiveView]);

  return (
    <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sol Panel - Önizleme, Yükleme, Liste (3/4 genişlik) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Canlı Önizleme */}
          <WatermarkPreview />
          
          {/* Dosya Yükleme */}
          <FileUploadZone />
          
          {/* Dosya Listesi */}
          <FileList />
        </div>
        
        {/* Sağ Panel - Dönüşüm Ayarları ve İstatistikler */}
        <div className="space-y-4">
          <ConversionPanel />
          <StatsPanel />
        </div>
      </div>
    </main>
  );
};

export default MultiPage;
