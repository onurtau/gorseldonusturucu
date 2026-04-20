import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { questionKey: 'q1', answerKey: 'a1' },
    { questionKey: 'q2', answerKey: 'a2' },
    { questionKey: 'q3', answerKey: 'a3' },
    { questionKey: 'q4', answerKey: 'a4' },
    { questionKey: 'q5', answerKey: 'a5' },
    { questionKey: 'q6', answerKey: 'a6' }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 sm:py-20 px-2 sm:px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('landing.faq.title')}
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {t('landing.faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden hover:border-primary-500/50 transition-colors duration-300"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between text-left group"
              >
                <span className="text-gray-900 font-semibold text-lg pr-4">
                  {t(`landing.faq.${faq.questionKey}`)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-3 sm:px-6 pb-3 sm:pb-5 text-gray-600 border-t border-gray-200 pt-3 sm:pt-4">
                  {t(`landing.faq.${faq.answerKey}`)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            {t('landing.faq.bottomText')}{' '}
            <a href="#contact" className="text-primary-400 hover:text-primary-300 transition-colors">
              {t('landing.faq.contactLink')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

