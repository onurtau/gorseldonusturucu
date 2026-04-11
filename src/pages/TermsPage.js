import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Shield, Users, Lock, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TermsPage = ({ onBackToLanding }) => {
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
            <span>{t('terms.backButton')}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-full mb-4">
            <FileText className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('terms.title')}</h1>
          <p className="text-gray-600">{t('terms.lastUpdated')}: 11 Nisan 2026</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8">
          
          {/* 1. Kabul ve Onay */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.acceptance.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.acceptance.content1')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.acceptance.content2')}
                </p>
              </div>
            </div>
          </section>

          {/* 2. Hizmet Tanımı */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.service.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.service.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('terms.service.feature1')}</li>
                  <li>{t('terms.service.feature2')}</li>
                  <li>{t('terms.service.feature3')}</li>
                  <li>{t('terms.service.feature4')}</li>
                  <li>{t('terms.service.feature5')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Kullanıcı Hesapları */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.accounts.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.accounts.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('terms.accounts.rule1')}</li>
                  <li>{t('terms.accounts.rule2')}</li>
                  <li>{t('terms.accounts.rule3')}</li>
                  <li>{t('terms.accounts.rule4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Kullanım Kuralları */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.usage.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.usage.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('terms.usage.prohibition1')}</li>
                  <li>{t('terms.usage.prohibition2')}</li>
                  <li>{t('terms.usage.prohibition3')}</li>
                  <li>{t('terms.usage.prohibition4')}</li>
                  <li>{t('terms.usage.prohibition5')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Gizlilik ve Veri Güvenliği */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.privacy.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.privacy.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('terms.privacy.point1')}</li>
                  <li>{t('terms.privacy.point2')}</li>
                  <li>{t('terms.privacy.point3')}</li>
                  <li>{t('terms.privacy.point4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Ücretlendirme ve Lisans */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.pricing.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.pricing.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('terms.pricing.point1')}</li>
                  <li>{t('terms.pricing.point2')}</li>
                  <li>{t('terms.pricing.point3')}</li>
                  <li>{t('terms.pricing.point4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Sorumluluk Reddi */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.disclaimer.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.disclaimer.content')}
                </p>
              </div>
            </div>
          </section>

          {/* 8. Değişiklikler */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.changes.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.changes.content')}
                </p>
              </div>
            </div>
          </section>

          {/* 9. İletişim */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.contact.title')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('terms.contact.content')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700">
                    <strong>E-posta:</strong>{' '}
                    <a href="mailto:destek@gorseldonusturucu.com" className="text-primary-500 hover:underline">
                      destek@gorseldonusturucu.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>{t('terms.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
