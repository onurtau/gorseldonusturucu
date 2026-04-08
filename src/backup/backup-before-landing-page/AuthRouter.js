import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';

/**
 * Auth Router - Login/Register/ForgotPassword arası geçiş
 */

const AuthRouter = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot-password'

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onSwitchToRegister={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onBackToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return <LoginPage />;
    }
  };

  return renderView();
};

export default AuthRouter;
