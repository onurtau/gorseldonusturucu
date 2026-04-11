import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Cookie, UserCheck, Mail, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPage = ({ onBackToLanding }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('privacy.backButton')}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('privacy.title')}</h1>
          <p className="text-gray-600">{t('privacy.lastUpdated')}: 11 Nisan 2026</p>
        </div>

        {/* Privacy Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8">
          
          {/* 1. Giriş */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.intro.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.intro.content1')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.intro.content2')}
                </p>
              </div>
            </div>
          </section>

          {/* 2. Toplanan Bilgiler */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.dataCollection.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.dataCollection.content')}
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{t('privacy.dataCollection.personalTitle')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>{t('privacy.dataCollection.personal1')}</li>
                  <li>{t('privacy.dataCollection.personal2')}</li>
                  <li>{t('privacy.dataCollection.personal3')}</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacy.dataCollection.usageTitle')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.dataCollection.usage1')}</li>
                  <li>{t('privacy.dataCollection.usage2')}</li>
                  <li>{t('privacy.dataCollection.usage3')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Verilerin Kullanımı */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.dataUsage.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.dataUsage.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.dataUsage.purpose1')}</li>
                  <li>{t('privacy.dataUsage.purpose2')}</li>
                  <li>{t('privacy.dataUsage.purpose3')}</li>
                  <li>{t('privacy.dataUsage.purpose4')}</li>
                  <li>{t('privacy.dataUsage.purpose5')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Görsel Dosyaların İşlenmesi */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.imageProcessing.title')}</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <p className="text-green-800 font-semibold mb-2">✅ {t('privacy.imageProcessing.important')}</p>
                  <p className="text-green-700 text-sm">
                    {t('privacy.imageProcessing.localProcessing')}
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.imageProcessing.point1')}</li>
                  <li>{t('privacy.imageProcessing.point2')}</li>
                  <li>{t('privacy.imageProcessing.point3')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Veri Güvenliği */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.dataSecurity.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.dataSecurity.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.dataSecurity.measure1')}</li>
                  <li>{t('privacy.dataSecurity.measure2')}</li>
                  <li>{t('privacy.dataSecurity.measure3')}</li>
                  <li>{t('privacy.dataSecurity.measure4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Çerezler (Cookies) */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Cookie className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.cookies.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.cookies.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.cookies.type1')}</li>
                  <li>{t('privacy.cookies.type2')}</li>
                  <li>{t('privacy.cookies.type3')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Üçüncü Taraf Hizmetler */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.thirdParty.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.thirdParty.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.thirdParty.service1')}</li>
                  <li>{t('privacy.thirdParty.service2')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Kullanıcı Hakları */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.userRights.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.userRights.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('privacy.userRights.right1')}</li>
                  <li>{t('privacy.userRights.right2')}</li>
                  <li>{t('privacy.userRights.right3')}</li>
                  <li>{t('privacy.userRights.right4')}</li>
                  <li>{t('privacy.userRights.right5')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Değişiklikler */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.changes.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.changes.content')}
                </p>
              </div>
            </div>
          </section>

          {/* 10. İletişim */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.contact.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('privacy.contact.content')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700">
                    <strong>E-posta:</strong>{' '}
                    <a href="mailto:gizlilik@gorseldonusturucu.com" className="text-primary-500 hover:underline">
                      gizlilik@gorseldonusturucu.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>{t('privacy.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
