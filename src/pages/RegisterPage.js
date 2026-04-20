import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle2, Globe, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';

const RegisterPage = ({ onSwitchToLogin, onBackToLanding }) => {
  const { t, language, changeLanguage } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { signUpWithEmail, signInWithGoogle, signInWithMicrosoft, isLoading, error, clearError } = useAuthStore();

  // Logo path (Electron veya Web)
  const logoSrc = window.electronAPI?.logo || `${process.env.PUBLIC_URL}/logo-192.png`;

  // Validation schema
  const registerSchema = z.object({
    fullName: z.string().min(2, t('auth.register.fullNameError')),
    email: z.string().email(t('auth.register.emailError')),
    password: z.string()
      .min(8, t('auth.register.passwordMinError'))
      .regex(/[A-Z]/, t('auth.register.passwordUpperError'))
      .regex(/[a-z]/, t('auth.register.passwordLowerError'))
      .regex(/[0-9]/, t('auth.register.passwordNumberError')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.register.passwordMatchError'),
    path: ['confirmPassword']
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const password = watch('password', '');

  // Component mount olduğunda formu temizle
  useEffect(() => {
    reset({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, [reset]);

  // Error temizle
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    const result = await signUpWithEmail(data.email, data.password, data.fullName);
    
    if (result.success) {
      if (result.emailVerificationRequired) {
        setRegistrationSuccess(true);
      }
      // Değilse otomatik login olur
    }
  };

  const handleGoogleSignup = async () => {
    await signInWithGoogle();
  };

  const handleMicrosoftSignup = async () => {
    await signInWithMicrosoft();
  };

  // Şifre gücü göstergesi
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: t('auth.register.weak'), color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: t('auth.register.medium'), color: 'bg-yellow-500' };
    return { strength: 100, label: t('auth.register.strong'), color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Email doğrulama başarılı ekranı
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-2 sm:p-4">
        {/* Back Button - Sol Üst Köşe */}
        {onBackToLanding && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900 group"
              title="Geri"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}
        
        {/* Language Toggle - Sağ Üst Köşe */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <button
            onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
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
              {t('auth.register.registrationSuccess')}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t('auth.register.emailVerificationSent')}
            </p>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary-300">
                💡 {t('auth.register.emailNotReceived')}
              </p>
            </div>

            <button
              onClick={onSwitchToLogin}
              className="
                w-full
                bg-gradient-to-r from-primary-500 to-primary-600
                hover:from-primary-600 hover:to-primary-700
                text-white font-semibold py-3 px-4 rounded-lg
                transition-all duration-200
                shadow-lg shadow-primary-500/20
              "
            >
              {t('auth.register.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-2 sm:p-4">
      {/* Back Button - Sol Üst Köşe */}
      {onBackToLanding && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900 group"
            title="Geri"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      )}
      
      {/* Language Toggle - Sağ Üst Köşe */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
        <button
          onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
          title="Dil Değiştir / Change Language"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium text-sm">{language === 'tr' ? 'TR' : 'EN'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-44 h-44 mb-6">
            <img src={logoSrc} alt="Görsel Dönüştürücü" className="w-full h-full drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.register.createAccount')}</h1>
          <p className="text-gray-600">{t('auth.register.subtitle')}</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  autoComplete="off"
                  className={`
                    w-full pl-10 pr-4 py-3 
                    bg-gray-50 border rounded-lg
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all
                    ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder={t('auth.register.emailPlaceholder')}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  autoComplete="new-password"
                  className={`
                    w-full pl-10 pr-12 py-3 
                    bg-gray-50 border rounded-lg
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all
                    ${errors.password ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{t('auth.register.passwordStrength')}</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.strength === 33 ? 'text-red-400' :
                      passwordStrength.strength === 66 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  className={`
                    w-full pl-10 pr-12 py-3 
                    bg-gray-50 border rounded-lg
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all
                    ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="text-xs text-gray-600">
              {t('auth.register.terms')}{' '}
              <a href="#terms" className="text-primary-400 hover:text-primary-300">
                {t('auth.register.termsLink')}
              </a>
              {' '}{t('auth.register.and')}{' '}
              <a href="#privacy" className="text-primary-400 hover:text-primary-300">
                {t('auth.register.privacyLink')}
              </a>
              {t('auth.register.termsAgree')}
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
                  <span>{t('auth.register.registering')}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{t('auth.register.registerButton')}</span>
                </>
              )}
            </button>
          </form>

          {/* OAuth Buttons - Geçici olarak devre dışı (Supabase'de aktif değil) */}
          {false && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-600">{t('auth.register.orContinueWith')}</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="
                w-full flex items-center justify-center gap-3
                bg-white hover:bg-gray-100
                text-gray-800 font-semibold py-3 px-4 rounded-lg
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-gray-300
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{t('auth.register.googleSignup')}</span>
            </button>

            <button
              onClick={handleMicrosoftSignup}
              disabled={isLoading}
              className="
                w-full flex items-center justify-center gap-3
                bg-[#2F2F2F] hover:bg-[#3F3F3F]
                text-white font-semibold py-3 px-4 rounded-lg
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>{t('auth.register.microsoftSignup')}</span>
            </button>
          </div>
            </>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.register.alreadyHaveAccount')}{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                {t('auth.register.loginLink')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t('auth.footer.copyright')}</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

