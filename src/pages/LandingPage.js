import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import ToolsSection from '../components/landing/ToolsSection';
import PremiumSection from '../components/landing/PremiumSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import ScrollToTop from '../components/landing/ScrollToTop';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import FormatConversionPage from './FormatConversionPage';
import ResizePage from './ResizePage';
import ColorSpacePage from './ColorSpacePage';
import WatermarkPage from './WatermarkPage';
import MultiPage from './MultiPage';
import PaymentSuccessPage from './PaymentSuccessPage';
import PaymentCancelPage from './PaymentCancelPage';

const LandingPage = () => {
  // Hash'den başlangıç view'ını al
  const getInitialView = () => {
    const hash = window.location.hash.slice(1);
    const validViews = [
      'login', 'register', 'forgot-password',
      'format-conversion', 'resize', 'colorspace', 'watermark', 'all-in-one',
      'payment/success', 'payment/cancel'
    ];
    return validViews.includes(hash) ? hash : 'landing';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // View değiştirme fonksiyonu
  const navigateTo = (view) => {
    setCurrentView(view);
    
    if (view === 'landing') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.history.pushState(null, '', `#${view}`);
    }
  };

  // Geri/ileri butonlarını dinle
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      setCurrentView(hash || 'landing');
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Public tool pages
  if (currentView === 'format-conversion') {
    return (
      <>
        <PublicHeader onBackToLanding={() => navigateTo('landing')} />
        <FormatConversionPage onBackToLanding={() => navigateTo('landing')} />
      </>
    );
  }

  if (currentView === 'resize') {
    return (
      <>
        <PublicHeader onBackToLanding={() => navigateTo('landing')} />
        <ResizePage onBackToLanding={() => navigateTo('landing')} />
      </>
    );
  }

  if (currentView === 'colorspace') {
    return (
      <>
        <PublicHeader onBackToLanding={() => navigateTo('landing')} />
        <ColorSpacePage onBackToLanding={() => navigateTo('landing')} />
      </>
    );
  }

  if (currentView === 'watermark') {
    return (
      <>
        <PublicHeader onBackToLanding={() => navigateTo('landing')} />
        <WatermarkPage onBackToLanding={() => navigateTo('landing')} />
      </>
    );
  }

  if (currentView === 'all-in-one') {
    return (
      <>
        <PublicHeader onBackToLanding={() => navigateTo('landing')} />
        <MultiPage onBackToLanding={() => navigateTo('landing')} />
      </>
    );
  }

  // Auth pages
  if (currentView === 'login') {
    return (
      <LoginPage
        onSwitchToRegister={() => navigateTo('register')}
        onForgotPassword={() => navigateTo('forgot-password')}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        onSwitchToLogin={() => navigateTo('login')}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onBackToLogin={() => navigateTo('login')}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  // Payment pages
  if (currentView === 'payment/success') {
    return <PaymentSuccessPage />;
  }

  if (currentView === 'payment/cancel') {
    return <PaymentCancelPage />;
  }

  // Landing page görünümü
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader
        onLoginClick={() => navigateTo('login')}
        onRegisterClick={() => navigateTo('register')}
      />
      
      <main>
        <ToolsSection navigateTo={navigateTo} />
        
        <HowItWorks />
        
        <FeaturesGrid />
        
        <PremiumSection
          onUpgrade={() => navigateTo('register')}
        />
        
        <FAQSection />
        
        <CTASection
          onGetStarted={() => navigateTo('register')}
        />
      </main>

      <Footer />
      
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;

