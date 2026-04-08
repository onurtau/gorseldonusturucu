import { createClient } from '@supabase/supabase-js';

// Supabase URL ve Key'i environment variables'dan al
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  Supabase yapılandırması eksik!');
  console.error('📝 .env dosyasını kontrol edin:');
  console.error('   - REACT_APP_SUPABASE_URL');
  console.error('   - REACT_APP_SUPABASE_ANON_KEY');
  console.error('📚 Detaylı bilgi için README.md dosyasına bakın.');
}

// Supabase client oluştur
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Session otomatik olarak localStorage'a kaydedilecek
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // OAuth callback sonrası redirect URL
    redirectTo: process.env.REACT_APP_OAUTH_REDIRECT_URL || 'http://localhost:3000/auth/callback'
  },
  // Realtime özellikleri (gelecekte kullanılabilir)
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Auth Helper Functions
 */

// Email + Şifre ile kayıt olma
export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

// Email + Şifre ile giriş yapma
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// Google ile giriş
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
};

// Microsoft ile giriş
export const signInWithMicrosoft = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email'
    }
  });

  if (error) throw error;
  return data;
};

// Çıkış yapma
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Şifre sıfırlama email gönderme
export const sendPasswordResetEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });

  if (error) throw error;
  return data;
};

// Şifre güncelleme
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
};

// Email doğrulama yeniden gönder
export const resendVerificationEmail = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
};

// 2FA (MFA) aktif et
export const enable2FA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  });

  if (error) throw error;
  return data; // QR code ve secret içerir
};

// 2FA doğrulama
export const verify2FA = async (factorId, code) => {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId
  });

  if (error) throw error;

  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: data.id,
    code
  });

  if (verifyError) throw verifyError;
  return verifyData;
};

// 2FA devre dışı bırak
export const disable2FA = async (factorId) => {
  const { error } = await supabase.auth.mfa.unenroll({
    factorId
  });

  if (error) throw error;
};

// Aktif faktörleri listele
export const list2FAFactors = async () => {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data;
};

// Mevcut kullanıcıyı al
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Session durumunu kontrol et
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Auth state değişikliklerini dinle
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
