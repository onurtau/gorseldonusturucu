import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle,
  signInWithMicrosoft,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  sendPasswordResetEmail,
  updatePassword,
  resendVerificationEmail,
  enable2FA,
  verify2FA,
  disable2FA,
  list2FAFactors,
  supabase
} from '../services/supabase';
import { db } from '../services/db';
import { getSessionMetadata } from '../utils/deviceInfo';

/**
 * Auth Store - Kullanıcı kimlik doğrulama ve profil yönetimi
 * 
 * Bu store:
 * - Kullanıcı giriş/çıkış işlemlerini yönetir
 * - Profil bilgilerini tutar
 * - Session durumunu takip eder
 * - Offline modda çalışır (IndexedDB cache)
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      
      // 2FA state
      mfaFactors: [],
      mfaRequired: false,
      mfaPendingFactorId: null,

      // Network state
      isOnline: navigator.onLine,
      
      // Session tracking
      currentSessionId: null,
      sessionUpdateInterval: null,

      /**
       * Retry mekanizması ile fonksiyonu çalıştır
       */
      retryWithTimeout: async (fn, retries = 2, timeout = 15000) => {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            console.log(`🔄 Deneme ${attempt + 1}/${retries}...`);
            
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('timeout')), timeout);
            });
            
            const result = await Promise.race([
              fn(),
              timeoutPromise
            ]);
            
            console.log(`✅ Başarılı (${attempt + 1}. denemede)`);
            return result;
            
          } catch (error) {
            console.warn(`⚠️ Deneme ${attempt + 1} başarısız:`, error.message);
            
            // Son deneme ise hatayı fırlat
            if (attempt === retries - 1) {
              console.error(`❌ Tüm denemeler başarısız (${retries} deneme)`);
              throw error;
            }
            
            // Tekrar denemeden önce 1 saniye bekle
            console.log('⏳ 1 saniye sonra tekrar deneniyor...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      },

      /**
       * Initialize - Uygulama başlangıcında session kontrolü
       */
      initialize: async () => {
        console.log('🔄 Auth initialization başladı...');
        set({ isLoading: true, error: null });
        
        // Timeout ekle - 10 saniyeden uzun sürerse vazgeç
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
        });

        try {
          // Mevcut session'ı kontrol et (timeout ile)
          console.log('📡 Session kontrol ediliyor...');
          const session = await Promise.race([
            getSession(),
            timeoutPromise
          ]);
          console.log('✅ Session sonucu:', session ? 'Var' : 'Yok');
          
          if (session) {
            const user = await Promise.race([
              getCurrentUser(),
              timeoutPromise
            ]);
            console.log('👤 Kullanıcı bilgisi alındı:', user?.email);
            
            // Profil bilgilerini cache'e kaydet
            await db.cacheUserProfile(user);
            
            set({
              user,
              session,
              isAuthenticated: true,
              isInitialized: true
            });

            console.log('📂 Profil yükleniyor...');
            
            // Profil bilgilerini yükle (timeout olsa bile kullanıcı authenticated kalsın)
            try {
              await get().loadProfile();
              console.log('✅ Profil yüklemesi tamamlandı');
            } catch (profileError) {
              console.warn('⚠️ Profil yüklenemedi, user_metadata kullanılıyor:', profileError.message);
              // Timeout olsa bile fallback profil oluştur
              const fallbackProfile = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                avatar_url: user.user_metadata?.avatar_url || null,
                phone: user.user_metadata?.phone || null,
                company: user.user_metadata?.company || null
              };
              set({ profile: fallbackProfile });
              console.log('✅ Fallback profil oluşturuldu');
            }
            
            // Session tracking başlat
            await get().trackSession(user.id);
            
            // Her şey bittikten sonra loading'i kapat
            set({ isLoading: false });
            console.log('✅ isLoading false yapıldı');
          } else {
            console.log('❌ Session yok, giriş ekranı gösteriliyor');
            set({
              isInitialized: true,
              isLoading: false
            });
          }
          console.log('✅ Auth initialization tamamlandı');
        } catch (error) {
          console.error('❌ Auth initialization error:', error);
          // Timeout veya hata durumunda kullanıcıyı login ekranına gönder
          set({ 
            error: error.message === 'Auth initialization timeout' 
              ? 'Bağlantı zaman aşımına uğradı' 
              : error.message,
            isLoading: false,
            isInitialized: true,
            isAuthenticated: false // Hata durumunda giriş ekranına yönlendir
          });
        } finally {
          // Çifte garanti: Her durumda loading'i kapat
          console.log('🛡️ Finally bloğu: isLoading false yapılıyor');
          set({ isLoading: false });
        }
      },

      /**
       * Email + Şifre ile giriş yap
       */
      signInWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, session } = await signInWithEmail(email, password);
          
          // Cache'e kaydet
          await db.cacheUserProfile(user);
          
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false
          });

          await get().loadProfile();
          
          // Session tracking başlat
          await get().trackSession(user.id);
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Email + Şifre ile kayıt ol
       */
      signUpWithEmail: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, session } = await signUpWithEmail(email, password, fullName);
          
          if (user) {
            await db.cacheUserProfile(user);
            
            set({
              user,
              session,
              isAuthenticated: !!session, // Email doğrulaması gerekiyorsa false
              isLoading: false
            });

            if (session) {
              await get().loadProfile();
            }
          }
          
          return { 
            success: true, 
            emailVerificationRequired: !session 
          };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Google ile giriş yap
       */
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await signInWithGoogle();
          // OAuth redirect olacak, callback'te handle edilecek
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Microsoft ile giriş yap
       */
      signInWithMicrosoft: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await signInWithMicrosoft();
          // OAuth redirect olacak, callback'te handle edilecek
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Çıkış yap
       */
      signOut: async () => {
        console.log('🚪 Çıkış yapılıyor...');
        
        // Session update interval'i durdur
        get().stopSessionUpdateInterval();
        
        // Mevcut session'ı sil
        const { currentSessionId } = get();
        if (currentSessionId) {
          try {
            await get().endSession(currentSessionId);
          } catch (error) {
            console.warn('⚠️ Session silme hatası (önemsiz):', error);
          }
        }
        
        // App state'i tamamen sıfırla (istatistikler hariç)
        const { resetAppState } = require('./useAppStore').default.getState();
        resetAppState();
        
        // HEMEN state'i temizle (kullanıcı anında login ekranını görsün)
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          mfaFactors: [],
          mfaRequired: false,
          error: null,
          currentSessionId: null
        });
        
        console.log('✅ UI güncellendi (anında)');

        // Arka planda temizlik işlemlerini yap (beklemeden)
        setTimeout(async () => {
          try {
            // Supabase'den çıkış yap (arka planda)
            await Promise.race([
              supabaseSignOut(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            console.log('✅ Supabase çıkış başarılı (arka plan)');
          } catch (error) {
            console.log('⚠️ Supabase çıkış hatası (önemsiz):', error.message);
          }

          try {
            // Local data temizle
            await db.clearAllData();
            console.log('✅ Local data temizlendi (arka plan)');
          } catch (error) {
            console.log('⚠️ Local data temizleme hatası:', error);
          }
        }, 0);
        
        return { success: true };
      },

      /**
       * Profil bilgilerini yükle
       */
      loadProfile: async () => {
        const { user } = get();
        if (!user) {
          console.log('⚠️ loadProfile: user yok, atlanıyor');
          return;
        }

        console.log('🔄 loadProfile başladı:', user.id);
        
        // Timeout ekle - 5 saniyeden uzun sürerse fallback kullan
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile load timeout')), 5000);
        });

        try {
          console.log('📡 Supabase\'den profil çekiliyor...');
          // Supabase'den genişletilmiş profil bilgisi çek (timeout ile)
          const { data, error } = await Promise.race([
            supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single(),
            timeoutPromise
          ]);
          
          console.log('📊 Profil query sonucu:', { data, error });
          
          let profile;
          
          if (error || !data) {
            // Tabloda yoksa user_metadata'dan oluştur
            console.warn('Profile not found in DB, using user_metadata');
            profile = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              avatar_url: user.user_metadata?.avatar_url || null,
              phone: user.user_metadata?.phone || null,
              company: user.user_metadata?.company || null
            };
          } else {
            // Supabase'den gelen veriyi kullan
            profile = {
              id: data.id,
              email: user.email,
              full_name: data.full_name,
              avatar_url: data.avatar_url,
              phone: data.phone,
              company: data.company
            };
          }

          console.log('📋 Profil set ediliyor:', profile);
          set({ profile });
          
          // Cache'e kaydet (fire-and-forget - beklemeden devam et)
          console.log('💾 IndexedDB\'ye kaydediliyor (arka plan)...');
          db.cacheUserProfile(user).then(
            () => console.log('✅ IndexedDB cache başarılı')
          ).catch(
            (err) => console.warn('⚠️ IndexedDB cache hatası (önemsiz):', err.message)
          );
          
          console.log('✅ loadProfile başarıyla tamamlandı');
        } catch (error) {
          console.error('❌ Profile load error:', error);
          
          // Timeout veya hata durumunda user_metadata'dan fallback profil oluştur
          const fallbackProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url || null,
            phone: user.user_metadata?.phone || null,
            company: user.user_metadata?.company || null
          };
          
          set({ profile: fallbackProfile });
          console.log('⚠️ Fallback profil kullanıldı (Supabase erişilemedi)');
          
          // Hatayı yukarı fırlat ki initialize handle etsin
          throw error;
        } finally {
          console.log('🏁 loadProfile finally bloğu tamamlandı');
        }
      },

      /**
       * Profil bilgilerini güncelle
       */
      updateProfile: async (updates) => {
        console.log('📝 updateProfile called:', updates);
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          
          if (!currentUser) {
            console.error('❌ No user session found');
            throw new Error('Kullanıcı oturumu bulunamadı');
          }

          console.log('👤 Updating profile for user:', currentUser.id);

          // Offline modda queue'ya ekle
          if (!navigator.onLine) {
            console.log('📴 Offline mode: Adding to queue');
            await db.addToOfflineQueue('UPDATE_PROFILE', updates);
            // Offline modda da local state'i güncelle
            const currentProfile = get().profile || {};
            const updatedProfile = { ...currentProfile, ...updates };
            set({ profile: updatedProfile });
          } else {
            // Online modda Supabase'e kaydet (UPSERT kullan)
            console.log('🔄 Attempting Supabase UPSERT...');
            
            const { data, error: upsertError } = await supabase
              .from('user_profiles')
              .upsert({
                id: currentUser.id,
                full_name: updates.full_name,
                phone: updates.phone || null,
                company: updates.company || null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              })
              .select();
            
            if (upsertError) {
              console.error('❌ Supabase upsert error:', upsertError);
              throw upsertError;
            }
            
            console.log('✅ Profile successfully saved to Supabase:', data);
            
            // Başarılı - local state'i güncelle
            const currentProfile = get().profile || {};
            const updatedProfile = { ...currentProfile, ...updates };
            set({ profile: updatedProfile });
          }
          
          console.log('✅ Profile update completed');
          return { success: true };
        } catch (error) {
          console.error('❌ updateProfile failed:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        } finally {
          // Her durumda loading'i kapat
          set({ isLoading: false });
        }
      },

      /**
       * Şifre sıfırlama email gönder
       */
      sendPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          await sendPasswordResetEmail(email);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Şifre güncelle
       */
      updatePassword: async (newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          await updatePassword(newPassword);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Email doğrulama gönder
       */
      resendVerification: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await resendVerificationEmail();
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * 2FA aktif et
       */
      enable2FA: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { id, totp, type } = await enable2FA();
          
          set({ isLoading: false });
          
          return { 
            success: true, 
            data: {
              factorId: id,
              qrCode: totp.qr_code,
              secret: totp.secret,
              type
            }
          };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * 2FA doğrula
       */
      verify2FA: async (factorId, code) => {
        set({ isLoading: true, error: null });
        
        try {
          await verify2FA(factorId, code);
          await get().load2FAFactors();
          
          set({ isLoading: false, mfaRequired: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * 2FA devre dışı bırak
       */
      disable2FA: async (factorId) => {
        set({ isLoading: true, error: null });
        
        try {
          await disable2FA(factorId);
          await get().load2FAFactors();
          
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * 2FA faktörleri yükle
       */
      load2FAFactors: async () => {
        try {
          const { totp } = await list2FAFactors();
          set({ mfaFactors: totp || [] });
        } catch (error) {
          console.error('Error loading 2FA factors:', error);
        }
      },

      /**
       * Auth state listener başlat
       */
      setupAuthListener: () => {
        const { data: { subscription } } = onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event, session);
          
          if (event === 'SIGNED_IN' && session) {
            const user = session.user;
            await db.cacheUserProfile(user);
            
            set({
              user,
              session,
              isAuthenticated: true
            });

            await get().loadProfile();
            await get().load2FAFactors();
            
            // Session tracking başlat
            await get().trackSession(user.id);
          } else if (event === 'SIGNED_OUT') {
            // Session tracking durdur
            get().stopSessionUpdateInterval();
            await db.clearAllData();
            
            set({
              user: null,
              session: null,
              profile: null,
              isAuthenticated: false,
              mfaFactors: []
            });
          } else if (event === 'MFA_CHALLENGE_VERIFIED') {
            set({ mfaRequired: false });
          }
        });

        return subscription;
      },

      /**
       * Online/Offline durumu güncelle
       */
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        if (isOnline) {
          // Online olduğunda offline queue'yu sync et
          get().syncOfflineQueue();
        }
      },

      /**
       * Offline queue'yu sync et
       */
      syncOfflineQueue: async () => {
        const queue = await db.getOfflineQueue();
        
        for (const item of queue) {
          try {
            // İşlemi gerçekleştir
            if (item.action === 'UPDATE_PROFILE') {
              await get().updateProfile(item.data);
            }
            // Diğer işlem tipleri buraya eklenebilir
            
            // Başarılı, queue'dan kaldır
            await db.markQueueItemSynced(item.id);
          } catch (error) {
            // Başarısız, retry count artır
            await db.incrementRetryCount(item.id);
            console.error('Queue sync error:', error);
          }
        }
      },

      /**
       * Aktif session'ları getir
       */
      getSessions: async () => {
        console.log('🔍 getSessions called');
        try {
          const currentUser = get().user;
          if (!currentUser) {
            console.warn('⚠️ No user session, returning empty array');
            return [];
          }

          console.log('📡 Fetching sessions for user:', currentUser.id);
          const { data, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('last_active', { ascending: false });

          if (error) {
            console.error('❌ Supabase session fetch error:', error);
            throw error;
          }
          
          console.log(`✅ Sessions loaded: ${data?.length || 0} sessions`);
          return data || [];
        } catch (error) {
          console.error('❌ getSessions error:', error);
          throw error; // Throw hatayı yukarı fırlat ki UI handle etsin
        }
      },

      /**
       * Session'ı sonlandır
       */
      endSession: async (sessionId) => {
        console.log('🗑️ endSession called for:', sessionId);
        try {
          const { error } = await supabase
            .from('user_sessions')
            .delete()
            .eq('id', sessionId);

          if (error) {
            console.error('❌ Session delete error:', error);
            throw error;
          }
          
          console.log('✅ Session deleted successfully');
          return { success: true };
        } catch (error) {
          console.error('❌ endSession failed:', error);
          return { success: false, error: error.message };
        }
      },

      /**
       * Yeni session kaydı oluştur
       */
      trackSession: async (userId) => {
        console.log('📍 trackSession called for user:', userId);
        try {
          // Cihaz bilgilerini topla
          const metadata = getSessionMetadata();
          
          // IP adresini almaya çalış (opsiyonel)
          let ipAddress = 'Unknown';
          try {
            const ipResponse = await fetch('https://api.ipify.org?format=json', { timeout: 3000 });
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
          } catch (ipError) {
            console.warn('⚠️ IP adresi alınamadı:', ipError.message);
          }

          // ÖNCE: Aynı cihazdan eski session'ları sil (duplicate önleme)
          console.log('🗑️ Cleaning up old sessions from same device...');
          try {
            await supabase
              .from('user_sessions')
              .delete()
              .eq('user_id', userId)
              .eq('device_name', metadata.device_name)
              .eq('platform', metadata.platform);
            console.log('✅ Old sessions cleaned');
          } catch (cleanupError) {
            console.warn('⚠️ Cleanup failed (continuing anyway):', cleanupError.message);
          }

          // SONRA: Yeni session kaydı oluştur
          const { data, error } = await supabase
            .from('user_sessions')
            .insert({
              user_id: userId,
              device_name: metadata.device_name,
              device_type: metadata.device_type,
              platform: metadata.platform,
              ip_address: ipAddress,
              user_agent: metadata.user_agent,
              is_current: true,
              last_active: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            console.error('❌ Session tracking error:', error);
            // Session tracking başarısız olsa bile devam et
            return null;
          }

          console.log('✅ Session tracked successfully:', data.id);
          set({ currentSessionId: data.id });
          
          // Periyodik güncelleme başlat (her 5 dakikada bir)
          get().startSessionUpdateInterval();
          
          return data.id;
        } catch (error) {
          console.error('❌ trackSession failed:', error);
          return null;
        }
      },

      /**
       * Session aktivitesini güncelle
       */
      updateSessionActivity: async () => {
        const { currentSessionId } = get();
        if (!currentSessionId) return;

        try {
          const { error } = await supabase
            .from('user_sessions')
            .update({ last_active: new Date().toISOString() })
            .eq('id', currentSessionId);

          if (error) {
            console.warn('⚠️ Session update failed:', error);
          } else {
            console.log('✅ Session activity updated');
          }
        } catch (error) {
          console.warn('⚠️ updateSessionActivity error:', error);
        }
      },

      /**
       * Periyodik session güncelleme başlat
       */
      startSessionUpdateInterval: () => {
        // Mevcut interval'i temizle
        const { sessionUpdateInterval } = get();
        if (sessionUpdateInterval) {
          clearInterval(sessionUpdateInterval);
        }

        // Yeni interval başlat (5 dakikada bir)
        const interval = setInterval(() => {
          get().updateSessionActivity();
        }, 5 * 60 * 1000); // 5 dakika

        set({ sessionUpdateInterval: interval });
        console.log('⏱️ Session update interval started');
      },

      /**
       * Periyodik session güncelleme durdur
       */
      stopSessionUpdateInterval: () => {
        const { sessionUpdateInterval } = get();
        if (sessionUpdateInterval) {
          clearInterval(sessionUpdateInterval);
          set({ sessionUpdateInterval: null });
          console.log('⏹️ Session update interval stopped');
        }
      },

      /**
       * Error temizle
       */
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Sadece bu alanları persist et
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
