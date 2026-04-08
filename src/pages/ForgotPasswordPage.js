import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import { logoBase64 } from '../assets/logoBase64';

const ForgotPasswordPage = ({ onBackToLogin, onBackToLanding }) => {
  const [emailSent, setEmailSent] = useState(false);
  const { sendPasswordReset, isLoading, error, clearError } = useAuthStore();
  const { t, language, changeLanguage } = useLanguage();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.forgotPassword.emailError'))
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  // Component mount olduğunda formu temizle
  useEffect(() => {
    reset({ email: '' });
  }, [reset]);

  const onSubmit = async (data) => {
    const result = await sendPasswordReset(data.email);
    
    if (result.success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-4">
        {/* Back Button - Sol Üst Köşe */}
        {onBackToLanding && (
          <div className="absolute top-4 left-4">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900 group"
              title="Geri"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}
        
        {/* Language Toggle - Sağ Üst Köşe */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
            title="Dil Değiştir / Change Language"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium text-sm">{language === 'tr' ? 'TR' : 'EN'}</span>
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.forgotPassword.emailSentTitle')}
            </h2>
            
            <p className="text-gray-600 mb-2">
              {t('auth.forgotPassword.emailSentTo')}{' '}<strong className="text-gray-900">{getValues('email')}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              {t('auth.forgotPassword.emailSentMessage')}
            </p>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary-300">
                💡 {t('auth.forgotPassword.emailNotReceived')}
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="
                w-full flex items-center justify-center gap-2
                bg-gradient-to-r from-primary-500 to-primary-600
                hover:from-primary-600 hover:to-primary-700
                text-white font-semibold py-3 px-4 rounded-lg
                transition-all duration-200
                shadow-lg shadow-primary-500/20
              "
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('auth.forgotPassword.backToLogin')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      {/* Back Button - Sol Üst Köşe */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900 group"
            title="Geri"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      )}
      
      {/* Language Toggle - Sağ Üst Köşe */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
          title="Dil Değiştir / Change Language"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium text-sm">{language === 'tr' ? 'TR' : 'EN'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-44 h-44 mb-6">
            <img src={logoBase64} alt="Görsel Dönüştürücü" className="w-full h-full drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgotPassword.title')}</h1>
          <p className="text-gray-600">{t('auth.forgotPassword.subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.forgotPassword.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  autoComplete="off"
                  className={`
                    w-full pl-10 pr-4 py-3 
                    bg-gray-50 border rounded-lg
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full flex items-center justify-center gap-2
                bg-gradient-to-r from-primary-500 to-primary-600
                hover:from-primary-600 hover:to-primary-700
                text-white font-semibold py-3 px-4 rounded-lg
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-primary-500/20
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('auth.forgotPassword.sending')}</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>{t('auth.forgotPassword.sendButton')}</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.forgotPassword.backToLogin')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

