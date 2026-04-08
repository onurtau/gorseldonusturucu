-- Session Tracking Sistemi için Supabase SQL Güncellemesi
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. user_sessions tablosuna INSERT politikası ekle
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. user_sessions tablosuna UPDATE politikası ekle (last_active güncellemesi için)
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Mevcut politikaları kontrol et (opsiyonel)
-- SELECT * FROM pg_policies WHERE tablename = 'user_sessions';

-- 4. is_current sütunu ekle (opsiyonel - mevcut cihazı işaretlemek için)
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false;

-- NOT: Eğer tablonuz yoksa, önce SUPABASE_SETUP.md'deki CREATE TABLE komutunu çalıştırın.
