import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker, { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import { enUS } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  User, Mail, Phone, Building2, Lock, Shield, 
  Smartphone, Monitor, Tablet, Trash2, LogOut,
  Camera, Save, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, Copy, Check, X, BarChart3, TrendingDown,
  FileImage, Palette, Droplet, Image as ImageIcon,
  ChevronDown, Calendar, List
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useAppStore from '../store/useAppStore';
import { useLanguage } from '../contexts/LanguageContext';

// Türkçe ve İngilizce locale'leri kaydet
registerLocale('tr', tr);
registerLocale('en', enUS);

// Validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  phone: z.string().optional(),
  company: z.string().optional()
});

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
});

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, sessions, statistics
  const [statisticsFilter, setStatisticsFilter] = useState('daily'); // daily, weekly, monthly, custom
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, format-conversion, resize, colorspace, watermark
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  
  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  
  // Session management states
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [sessionToEnd, setSessionToEnd] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const { t, language } = useLanguage();

  const { 
    user, 
    profile, 
    updateProfile, 
    updatePassword, 
    signOut,
    enable2FA,
    verify2FA,
    disable2FA,
    load2FAFactors,
    mfaFactors,
    getSessions,
    endSession,
    isLoading,
    error,
    clearError 
  } = useAuthStore();

  const { setActiveView, addNotification, stats } = useAppStore();

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      company: profile?.company || ''
    }
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema)
  });

  // 2FA durumunu yükle
  useEffect(() => {
    if (user) {
      load2FAFactors();
    }
  }, [user, load2FAFactors]);

  // Session'ları yükle
  useEffect(() => {
    if (user && activeTab === 'sessions') {
      loadSessions();
    }
  }, [user, activeTab, loadSessions]);

  const loadSessions = async () => {
    console.log('🔄 Loading sessions...');
    setLoadingSessions(true);
    try {
      const sessionsData = await getSessions();
      console.log('📊 Sessions received:', sessionsData);
      setSessions(sessionsData || []);
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
      setSessions([]); // Hata durumunda boş array
      addNotification({
        type: 'error',
        title: t('notifications.error'),
        message: error.message || 'Oturumlar yüklenemedi'
      });
    } finally {
      console.log('✅ Loading sessions completed');
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    setIs2FAEnabled(mfaFactors && mfaFactors.length > 0);
  }, [mfaFactors]);

  // Tarih filtresi uygulandığında custom moda geç
  useEffect(() => {
    if (startDate) {
      setStatisticsFilter('custom');
    } else if (statisticsFilter === 'custom' && !startDate) {
      setStatisticsFilter('daily');
    }
  }, [startDate]);

  // Tarihleri uygula
  const applyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsDatePickerOpen(false);
  };

  // Tarihleri temizle
  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setTempStartDate(null);
    setTempEndDate(null);
    setIsDatePickerOpen(false);
    setStatisticsFilter('daily');
  };

  // Custom Input Component (forwardRef ile)
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className={`
        px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
        ${statisticsFilter === 'custom'
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
          : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-600'
        }
      `}
    >
      <Calendar className="w-4 h-4" />
      {startDate && endDate
        ? `${startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`
        : startDate
        ? startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
        : t('profilePage.customDate')
      }
      {startDate && (
        <X 
          className="w-4 h-4 hover:text-red-400" 
          onClick={(e) => {
            e.stopPropagation();
            clearDateFilter();
          }}
        />
      )}
    </button>
  ));
  CustomDateInput.displayName = 'CustomDateInput';

  // Clear error on tab change
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  const onProfileSubmit = async (data) => {
    console.log('📤 Submitting profile update:', data);
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        setProfileUpdateSuccess(true);
        addNotification({
          type: 'success',
          title: t('notifications.profileUpdated'),
          message: t('notifications.profileUpdatedMessage')
        });
        setTimeout(() => setProfileUpdateSuccess(false), 3000);
      } else {
        // Başarısız durumu handle et
        addNotification({
          type: 'error',
          title: t('notifications.error'),
          message: result.error || 'Profil güncellenemedi'
        });
      }
    } catch (error) {
      console.error('❌ Profile submit error:', error);
      addNotification({
        type: 'error',
        title: t('notifications.error'),
        message: error.message || 'Beklenmeyen bir hata oluştu'
      });
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await updatePassword(data.newPassword);
    
    if (result.success) {
      setPasswordUpdateSuccess(true);
      passwordForm.reset();
      addNotification({
        type: 'success',
        title: t('notifications.passwordUpdated'),
        message: t('notifications.passwordUpdatedMessage')
      });
      setTimeout(() => setPasswordUpdateSuccess(false), 3000);
    }
  };

  const handleEnable2FA = async () => {
    const result = await enable2FA();
    
    if (result.success) {
      setQrCode(result.data.qrCode);
      setSecret(result.data.secret);
      setFactorId(result.data.factorId);
      setShow2FASetup(true);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      addNotification({
        type: 'error',
        title: t('notifications.error'),
        message: t('notifications.enterSixDigitCode')
      });
      return;
    }

    const result = await verify2FA(factorId, verificationCode);
    
    if (result.success) {
      setShow2FASetup(false);
      setIs2FAEnabled(true);
      setVerificationCode('');
      addNotification({
        type: 'success',
        title: '2FA Aktif',
        message: t('notifications.twoFactorEnabled')
      });
      await load2FAFactors();
    }
  };

  const handleDisable2FA = async () => {
    if (mfaFactors && mfaFactors.length > 0) {
      const factor = mfaFactors[0];
      const result = await disable2FA(factor.id);
      
      if (result.success) {
        setIs2FAEnabled(false);
        addNotification({
          type: 'success',
          title: t('notifications.twoFactorDisabled'),
          message: t('notifications.twoFactorDisabledMessage')
        });
        await load2FAFactors();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveView('home');
  };

  const handleEndSession = (sessionId) => {
    setSessionToEnd(sessionId);
    setShowEndSessionConfirm(true);
  };

  const confirmEndSession = async () => {
    if (!sessionToEnd) return;
    
    console.log('🔴 Confirming session end:', sessionToEnd);
    
    try {
      const result = await endSession(sessionToEnd);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: t('notifications.sessionEnded'),
          message: t('notifications.sessionEndedMessage')
        });
        
        // Session'ları yeniden yükle
        console.log('♻️ Reloading sessions after delete');
        await loadSessions();
      } else {
        throw new Error(result.error || 'Session sonlandırılamadı');
      }
      
    } catch (error) {
      console.error('❌ Session end error:', error);
      addNotification({
        type: 'error',
        title: t('notifications.error'),
        message: error.message || 'Oturum sonlandırılamadı'
      });
    } finally {
      setShowEndSessionConfirm(false);
      setSessionToEnd(null);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('profilePage.title')}</h1>
        <p className="text-gray-400">{t('profilePage.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-dark-600">
        <button
          onClick={() => setActiveTab('profile')}
          className={`
            pb-3 px-4 font-semibold transition-colors relative
            ${activeTab === 'profile' 
              ? 'text-primary-400' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{t('profilePage.tabs.profile')}</span>
          </div>
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`
            pb-3 px-4 font-semibold transition-colors relative
            ${activeTab === 'security' 
              ? 'text-primary-400' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>{t('profilePage.tabs.security')}</span>
          </div>
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`
            pb-3 px-4 font-semibold transition-colors relative
            ${activeTab === 'sessions' 
              ? 'text-primary-400' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            <span>{t('profilePage.tabs.sessions')}</span>
          </div>
          {activeTab === 'sessions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`
            pb-3 px-4 font-semibold transition-colors relative
            ${activeTab === 'statistics' 
              ? 'text-primary-400' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>{t('profilePage.tabs.statistics')}</span>
          </div>
          {activeTab === 'statistics' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Info Card */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">{t('profilePage.personalInfo')}</h3>

              {/* Success Message */}
              {profileUpdateSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">{t('profilePage.updateSuccess')}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                {/* Avatar Upload (Future feature) */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{profile?.full_name}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email değiştirilemez</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.fullName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      {...profileForm.register('full_name')}
                      className={`
                        w-full pl-10 pr-4 py-3 bg-dark-900 border rounded-lg text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${profileForm.formState.errors.full_name ? 'border-red-500' : 'border-dark-600'}
                      `}
                    />
                  </div>
                  {profileForm.formState.errors.full_name && (
                    <p className="mt-1 text-sm text-red-400">
                      {profileForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.phone')} <span className="text-gray-500">({t('common.optional')})</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      {...profileForm.register('phone')}
                      placeholder="+90 555 123 45 67"
                      className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.company')} <span className="text-gray-500">({t('common.optional')})</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      {...profileForm.register('company')}
                      placeholder={t('profilePage.companyPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('common.saving')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{t('profilePage.save')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Change Card */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">{t('profilePage.changePassword')}</h3>

              {passwordUpdateSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">{t('profilePage.passwordUpdated')}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      className={`
                        w-full pl-10 pr-12 py-3 bg-dark-900 border rounded-lg text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${passwordForm.formState.errors.newPassword ? 'border-red-500' : 'border-dark-600'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('profilePage.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      className={`
                        w-full pl-10 pr-12 py-3 bg-dark-900 border rounded-lg text-white
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${passwordForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-dark-600'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('common.updating')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>{t('profilePage.updatePassword')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2FA Card */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('profilePage.twoFactor')}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('profilePage.twoFactorDesc')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  is2FAEnabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {is2FAEnabled ? t('common.active') : t('common.inactive')}
                </div>
              </div>

              {!is2FAEnabled && !show2FASetup && (
                <div>
                  <p className="text-gray-300 mb-4">
                    {t('profilePage.twoFactorAuthDesc')}
                  </p>
                  <button
                    onClick={handleEnable2FA}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>{t('profilePage.enable2FA')}</span>
                  </button>
                </div>
              )}

              {show2FASetup && (
                <div className="space-y-4">
                  <div className="bg-dark-900 rounded-lg p-6 text-center">
                    <p className="text-gray-300 mb-4">
                      Authenticator uygulamanızla bu QR kodu tarayın:
                    </p>
                    {qrCode && (
                      <div className="inline-block p-4 bg-white rounded-lg">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Manuel kod:</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="px-4 py-2 bg-dark-800 rounded text-primary-400 font-mono">
                          {secret}
                        </code>
                        <button
                          onClick={copySecret}
                          className="p-2 hover:bg-dark-700 rounded transition-colors"
                        >
                          {secretCopied ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('profilePage.verificationCode')}
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleVerify2FA}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{t('profilePage.verify')}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShow2FASetup(false);
                        setVerificationCode('');
                      }}
                      className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {is2FAEnabled && !show2FASetup && (
                <div>
                  <div className="flex items-center gap-3 mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">
                      İki faktörlü doğrulama aktif. Hesabınız ekstra güvenlik altında.
                    </p>
                  </div>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>{t('profilePage.disable2FA')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {/* Filter Buttons + Tarih Seçici */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => {
                  setStatisticsFilter('daily');
                  setStartDate(null);
                  setEndDate(null);
                }}
                className={`
                  px-6 py-2.5 rounded-lg font-semibold transition-all
                  ${statisticsFilter === 'daily'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-600'
                  }
                `}
              >
                {t('profilePage.daily')}
              </button>
              <button
                onClick={() => {
                  setStatisticsFilter('weekly');
                  setStartDate(null);
                  setEndDate(null);
                }}
                className={`
                  px-6 py-2.5 rounded-lg font-semibold transition-all
                  ${statisticsFilter === 'weekly'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-600'
                  }
                `}
              >
                {t('profilePage.weekly')}
              </button>
              <button
                onClick={() => {
                  setStatisticsFilter('monthly');
                  setStartDate(null);
                  setEndDate(null);
                }}
                className={`
                  px-6 py-2.5 rounded-lg font-semibold transition-all
                  ${statisticsFilter === 'monthly'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700 border border-dark-600'
                  }
                `}
              >
                {t('profilePage.monthly')}
              </button>
              
              {/* Tarih Seçici - Popup Takvim */}
              <div className="relative date-picker-wrapper">
                <DatePicker
                  selected={tempStartDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setTempStartDate(start);
                    setTempEndDate(end);
                  }}
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  selectsRange
                  locale={language === 'tr' ? 'tr' : 'en'}
                  dateFormat="dd.MM.yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  monthsShown={2}
                  open={isDatePickerOpen}
                  onClickOutside={() => setIsDatePickerOpen(false)}
                  onInputClick={() => {
                    setTempStartDate(startDate);
                    setTempEndDate(endDate);
                    setIsDatePickerOpen(true);
                  }}
                  shouldCloseOnSelect={false}
                  customInput={<CustomDateInput />}
                >
                  {/* Takvim İçeriği - Apply/Clear Butonları */}
                  <div className="flex items-center justify-end gap-2 p-3 border-t border-dark-600 bg-dark-800">
                    <button
                      onClick={() => {
                        setTempStartDate(null);
                        setTempEndDate(null);
                      }}
                      className="px-4 py-2 text-sm bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
                    >
                      {t('profilePage.clear')}
                    </button>
                    <button
                      onClick={applyDateFilter}
                      disabled={!tempStartDate}
                      className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 
                               disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors
                               flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('profilePage.apply')}
                    </button>
                  </div>
                </DatePicker>
              </div>
            </div>

            {/* Kategori Seçimi */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <List className="w-4 h-4 inline mr-2" />
                {t('profilePage.categoryFilter')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         cursor-pointer hover:border-dark-500 transition-colors"
              >
                <option value="all">{t('profilePage.allOperations')}</option>
                <option value="format-conversion">{t('profilePage.formatConversionCategory')}</option>
                <option value="resize">{t('profilePage.resizeCategory')}</option>
                <option value="colorspace">{t('profilePage.colorspaceCategory')}</option>
                <option value="watermark">{t('profilePage.watermarkCategory')}</option>
              </select>
            </div>

            {(() => {
              // stats hook'undan geliyor (satır 71)
              const now = Date.now();
              const dayMs = 24 * 60 * 60 * 1000;
              const weekMs = 7 * dayMs;
              const monthMs = 30 * dayMs;
              
              // Zaman ve kategori filtreleme
              const filteredOps = stats.operations.filter(op => {
                let timeMatch = false;
                
                if (startDate) {
                  // Özel tarih aralığı seçilmiş
                  const start = new Date(startDate);
                  start.setHours(0, 0, 0, 0);
                  const startTime = start.getTime();
                  
                  const end = new Date(endDate || startDate);
                  end.setHours(23, 59, 59, 999);
                  const endTime = end.getTime();
                  
                  timeMatch = op.timestamp >= startTime && op.timestamp <= endTime;
                } else {
                  // Günlük/Haftalık/Aylık modlar
                  let filterMs = dayMs;
                  if (statisticsFilter === 'weekly') filterMs = weekMs;
                  if (statisticsFilter === 'monthly') filterMs = monthMs;
                  timeMatch = now - op.timestamp < filterMs;
                }
                
                const categoryMatch = selectedCategory === 'all' || op.type === selectedCategory;
                return timeMatch && categoryMatch;
              });
              
              // Toplam işlem sayısı
              const totalOps = filteredOps.length;
              
              // Format dönüştürme analizleri
              const formatConversions = {};
              const resizeOps = filteredOps.filter(op => op.type === 'resize');
              const colorspaceOps = filteredOps.filter(op => op.type === 'colorspace');
              const watermarkOps = filteredOps.filter(op => op.type === 'watermark');
              
              // Toplam kazanılan alan
              let totalSaved = 0;
              filteredOps.forEach(op => {
                if (op.details.originalTotalSize && op.details.newTotalSize) {
                  totalSaved += (op.details.originalTotalSize - op.details.newTotalSize);
                }
              });
              
              // Format dönüştürme detayları
              filteredOps.filter(op => op.type === 'format-conversion').forEach(op => {
                if (op.details.formatConversions) {
                  op.details.formatConversions.forEach(fc => {
                    const key = `${fc.from.toUpperCase()} → ${fc.to.toUpperCase()}`;
                    formatConversions[key] = (formatConversions[key] || 0) + fc.count;
                  });
                }
              });
              
              const totalSavedMB = (totalSaved / (1024 * 1024)).toFixed(2);
              const totalSavedGB = (totalSaved / (1024 * 1024 * 1024)).toFixed(2);
              
              return (
                <>
                  {/* Özet Kartlar - Kategori seçiliyse sadece 2 kart */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    selectedCategory === 'all' ? 'lg:grid-cols-4' : ''
                  }`}>
                    {/* Toplam İşlem */}
                    <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-primary-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{totalOps}</p>
                      <p className="text-sm text-gray-400">{t('profilePage.totalOperations')}</p>
                    </div>
                    
                    {/* Kazanılan Alan */}
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {totalSavedGB > 1 ? `${totalSavedGB} GB` : `${totalSavedMB} MB`}
                      </p>
                      <p className="text-sm text-gray-400">{t('profilePage.spaceSaved')}</p>
                    </div>
                    
                    {/* Format Dönüştürme - Sadece "Tüm İşlemler" seçiliyse göster */}
                    {selectedCategory === 'all' && (
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <FileImage className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                          {Object.values(formatConversions).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-sm text-gray-400">{t('profilePage.formatConversions')}</p>
                      </div>
                    )}
                    
                    {/* Filigran Ekleme - Sadece "Tüm İşlemler" seçiliyse göster */}
                    {selectedCategory === 'all' && (
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Droplet className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                          {watermarkOps.reduce((sum, op) => sum + (op.details.fileCount || 0), 0)}
                        </p>
                        <p className="text-sm text-gray-400">{t('profilePage.watermarksAdded')}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Detaylı İstatistikler */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Format Dönüştürme Detayları */}
                    {Object.keys(formatConversions).length > 0 && (
                      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <FileImage className="w-6 h-6 text-blue-400" />
                          {t('profilePage.formatConversions')}
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(formatConversions).map(([key, count]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                              <span className="text-gray-300 font-medium">{key}</span>
                              <span className="text-primary-400 font-bold">{count} {t('profilePage.files')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Boyut Küçültme */}
                    {resizeOps.length > 0 && (
                      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6 text-orange-400" />
                          {t('profilePage.resizeOperations')}
                        </h3>
                        <div className="space-y-3">
                          {resizeOps.map((op, idx) => {
                            const saved = op.details.originalTotalSize - op.details.newTotalSize;
                            const savedMB = (saved / (1024 * 1024)).toFixed(2);
                            return (
                              <div key={idx} className="p-3 bg-dark-900 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-gray-300">{op.details.fileCount} {t('profilePage.files')}</span>
                                  <span className="text-green-400 font-semibold">{savedMB} MB</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(op.timestamp).toLocaleString('tr-TR')}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Renk Uzayı Dönüşümleri */}
                    {colorspaceOps.length > 0 && (
                      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <Palette className="w-6 h-6 text-pink-400" />
                          {t('profilePage.colorspaceConversions')}
                        </h3>
                        <div className="space-y-3">
                          {colorspaceOps.map((op, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                              <span className="text-gray-300">
                                {op.details.fromColorSpace?.toUpperCase()} → {op.details.toColorSpace?.toUpperCase()}
                              </span>
                              <span className="text-primary-400 font-bold">{op.details.fileCount} {t('profilePage.files')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Filigran İşlemleri */}
                    {watermarkOps.length > 0 && (
                      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <Droplet className="w-6 h-6 text-purple-400" />
                          {t('profilePage.watermarkOperations')}
                        </h3>
                        <div className="space-y-3">
                          {watermarkOps.map((op, idx) => (
                            <div key={idx} className="p-3 bg-dark-900 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-300">{op.details.fileCount} {t('profilePage.filesWatermarked')}</span>
                                <span className="text-purple-400 font-semibold">
                                  {op.details.watermarkType === 'tile' ? t('profilePage.tile') : t('profilePage.single')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(op.timestamp).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* İşlem Geçmişi Listesi */}
                  {filteredOps.length > 0 && (
                    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary-400" />
                        {t('profilePage.operationHistory')}
                        <span className="text-sm text-gray-400 font-normal ml-2">
                          ({filteredOps.length} {t('profilePage.operations')})
                        </span>
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-dark-600">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">{t('profilePage.date')}</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">{t('profilePage.category')}</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">{t('profilePage.details')}</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">{t('profilePage.fileCount')}</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">{t('profilePage.savings')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOps
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .map((op, idx) => {
                                const getCategoryInfo = (type) => {
                                  switch(type) {
                                    case 'format-conversion':
                                      return { icon: '📄', name: t('profilePage.formatConversionName'), color: 'text-blue-400' };
                                    case 'resize':
                                      return { icon: '📏', name: t('profilePage.resizeName'), color: 'text-orange-400' };
                                    case 'colorspace':
                                      return { icon: '🎨', name: t('profilePage.colorspaceName'), color: 'text-pink-400' };
                                    case 'watermark':
                                      return { icon: '💧', name: t('profilePage.watermarkName'), color: 'text-purple-400' };
                                    default:
                                      return { icon: '📋', name: t('profilePage.operationName'), color: 'text-gray-400' };
                                  }
                                };
                                
                                const getDetails = (op) => {
                                  if (op.type === 'format-conversion' && op.details.formatConversions) {
                                    return op.details.formatConversions
                                      .map(fc => `${fc.from.toUpperCase()}→${fc.to.toUpperCase()} (${fc.count})`)
                                      .join(', ');
                                  }
                                  if (op.type === 'resize' && op.details.resizeType) {
                                    const typeMap = {
                                      'targetSize': t('profilePage.targetSize'),
                                      'percentage': t('profilePage.percentage'),
                                      'dimension': t('profilePage.dimension')
                                    };
                                    return typeMap[op.details.resizeType] || op.details.resizeType;
                                  }
                                  if (op.type === 'colorspace') {
                                    return `${op.details.fromColorSpace?.toUpperCase() || 'sRGB'}→${op.details.toColorSpace?.toUpperCase()}`;
                                  }
                                  if (op.type === 'watermark') {
                                    return op.details.watermarkType === 'tile' ? t('profilePage.tile') : t('profilePage.single');
                                  }
                                  return '-';
                                };
                                
                                const saved = op.details.originalTotalSize && op.details.newTotalSize
                                  ? op.details.originalTotalSize - op.details.newTotalSize
                                  : 0;
                                const savedMB = (saved / (1024 * 1024)).toFixed(2);
                                
                                const categoryInfo = getCategoryInfo(op.type);
                                
                                return (
                                  <tr key={op.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="text-sm text-gray-300">
                                        {new Date(op.timestamp).toLocaleDateString('tr-TR')}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(op.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className={`flex items-center gap-2 ${categoryInfo.color}`}>
                                        <span>{categoryInfo.icon}</span>
                                        <span className="text-sm font-medium">{categoryInfo.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="text-sm text-gray-300">{getDetails(op)}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <span className="text-sm text-gray-300 font-semibold">
                                        {op.details.fileCount || 0}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      {saved > 0 ? (
                                        <span className="text-sm text-green-400 font-semibold">
                                          {savedMB} MB
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-500">-</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Veri Yoksa */}
                  {totalOps === 0 && (
                    <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
                      <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">
                        {(() => {
                          if (selectedCategory === 'all') return t('profilePage.noOperationsInPeriod');
                          if (selectedCategory === 'format-conversion') return t('profilePage.noFormatConversionInPeriod');
                          if (selectedCategory === 'resize') return t('profilePage.noResizeInPeriod');
                          if (selectedCategory === 'colorspace') return t('profilePage.noColorspaceInPeriod');
                          if (selectedCategory === 'watermark') return t('profilePage.noWatermarkInPeriod');
                          return t('profilePage.noOperationInPeriod');
                        })()}
                      </h3>
                      <p className="text-gray-500">
                        {(() => {
                          const hasCategory = selectedCategory !== 'all';
                          if (statisticsFilter === 'daily') {
                            return hasCategory ? t('profilePage.noOperationsTodayCategory') : t('profilePage.noOperationsToday');
                          }
                          if (statisticsFilter === 'weekly') {
                            return hasCategory ? t('profilePage.noOperationsThisWeekCategory') : t('profilePage.noOperationsThisWeek');
                          }
                          if (statisticsFilter === 'monthly') {
                            return hasCategory ? t('profilePage.noOperationsThisMonthCategory') : t('profilePage.noOperationsThisMonth');
                          }
                          return '';
                        })()}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">{t('profilePage.activeSessions')}</h3>
            
            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400 mb-3" />
                <p className="text-gray-400 text-sm">{t('common.loading')}...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aktif oturum bulunamadı</p>
                <p className="text-gray-500 text-sm">Henüz kayıtlı oturum bilgisi yok</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/20 rounded-lg text-primary-400">
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{session.device_name}</p>
                        {session.is_current && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                            {t('profilePage.currentDevice')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{session.platform}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('profilePage.lastActive')}: {new Date(session.last_active).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </p>
                      <p className="text-xs text-gray-500">{t('profilePage.ipAddress')}: {session.ip_address}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="p-2 hover:bg-dark-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    title={t('profilePage.endSession')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            )}

            <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <p className="text-sm text-primary-300">
                {t('profilePage.sessionWarning')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {showEndSessionConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {t('profilePage.endSessionConfirmTitle')}
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              {t('profilePage.endSessionConfirmMessage')}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEndSessionConfirm(false);
                  setSessionToEnd(null);
                }}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                {t('profilePage.endSession')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
