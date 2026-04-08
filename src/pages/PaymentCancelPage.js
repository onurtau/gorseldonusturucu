import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto p-8">
        <XCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ödeme İptal Edildi</h1>
        <p className="text-lg text-gray-700 mb-6">
          Premium üyelik için ödeme işlemi iptal edildi.
        </p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <p className="text-gray-600 mb-4">
            Ödeme işlemini tamamlamadınız. Ücretsiz kullanıcı olarak devam edebilirsiniz.
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>✅ Haftada 10 işlem hakkı</li>
            <li>✅ Tüm formatlar kullanılabilir</li>
            <li>✅ Tüm araçlar erişilebilir</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
          <button
            onClick={() => navigate('/#premium')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Premium'a Tekrar Bak
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Sorularınız mı var? <a href="mailto:destek@gorseldonusturucu.com" className="text-primary-500 hover:underline">Bize ulaşın</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
