import { createClient } from '@supabase/supabase-js';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';
import { DB_CONFIG } from './database';

// Supabase client'ı oluştur
export const supabase = createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
    storage: {
        maxRetries: 3,
        retryDelay: 1000,
    }
});

// Storage kontrol fonksiyonu
const checkStorage = async () => {
    try {
        console.log('Storage kontrol ediliyor...');
        
        // buildings bucket'ını kontrol et
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('data');
        
        if (bucketError) {
            console.error('buildings bucket kontrol hatası:', bucketError);
            throw new Error('buildings bucket bulunamadı. Lütfen Supabase Dashboard üzerinden oluşturun.');
        }

        if (!bucketData) {
            throw new Error('buildings bucket bulunamadı. Lütfen Supabase Dashboard üzerinden oluşturun.');
        }

        console.log('buildings bucket mevcut:', bucketData);
        
    } catch (error) {
        console.error('Storage kontrol hatası:', error);
        throw error;
    }
};

// Storage'ı kontrol et
checkStorage().catch(error => {
    console.error('Storage kontrol işlemi başarısız:', error);
});

// Veritabanı bağlantı bilgileri
export const dbConfig = {
    ...DB_CONFIG,
    // Diğer veritabanı yapılandırma bilgileri buraya eklenebilir
}; 