import React from 'react';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Logo path (Electron veya Web)
  const logoSrc = window.electronAPI?.logo || `${process.env.PUBLIC_URL}/logo-192.png`;

  const footerLinks = {
    product: [
      { label: t('landing.footer.features'), href: '#features' },
      { label: t('landing.footer.pricing'), href: '#pricing' },
      { label: t('landing.footer.faq'), href: '#faq' }
    ],
    company: [
      { label: t('landing.footer.about'), href: '#about' },
      { label: t('landing.footer.contact'), href: '#contact' },
      { label: t('landing.footer.blog'), href: '#blog' }
    ],
    legal: [
      { label: t('landing.footer.privacy'), href: '#privacy' },
      { label: t('landing.footer.terms'), href: '#terms' }
    ]
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logoSrc} 
                alt="Zylorpix" 
                className="w-10 h-10"
              />
              <h3 className="text-xl font-bold gradient-text">Zylorpix</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              {t('landing.footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#twitter" className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#github" className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <Github className="w-5 h-5" />
              </a>
              <a href="#linkedin" className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#email" className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">{t('landing.footer.productTitle')}</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">{t('landing.footer.companyTitle')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-gray-900 font-semibold mb-4 mt-6">{t('landing.footer.legalTitle')}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            {t('auth.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


