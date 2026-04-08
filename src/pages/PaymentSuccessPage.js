import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import paymentService from '../services/paymentService';
import useAuthStore from '../store/useAuthStore';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refreshUser = useAuthStore(state => state.refreshUser);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setVerifying(false);
        return;
      }

      try {
        await paymentService.verifyPayment(sessionId);
        
        // Refresh user data to update premium status
        if (refreshUser) {
          await refreshUser();
        }

        setVerifying(false);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.message);
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, refreshUser]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödemeniz Doğrulanıyor...</h2>
          <p className="text-gray-600">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Hatası</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center max-w-md mx-auto p-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Ödeme Başarılı!</h1>
        <p className="text-lg text-gray-700 mb-2">Premium üyeliğiniz aktif edildi</p>
        <p className="text-gray-600 mb-8">Artık tüm premium özelliklere sınırsız erişiminiz var!</p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Üyelik</span>
            <span className="font-bold text-primary-600">Premium</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Durum</span>
            <span className="font-bold text-green-600">✅ Aktif</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">Kontrol panelinize yönlendiriliyorsunuz...</p>

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
        >
          Kontrol Paneline Git
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
