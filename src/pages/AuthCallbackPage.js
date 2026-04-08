import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

/**
 * OAuth Callback Page
 * 
 * Google veya Microsoft ile giriş sonrası redirect URL'i.
 * Token'ları işler ve kullanıcıyı ana sayfaya yönlendirir.
 */

const AuthCallbackPage = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Session'ı yeniden yükle
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Giriş yapılıyor...</h2>
        <p className="text-gray-400">Lütfen bekleyin</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
