import { supabase } from '../config/supabaseClient';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const migrateImages = async () => {
    try {
        // Mevcut görselleri getir
        const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS.GET_ALL);
        const buildings = response.data.data;

        console.log(`Toplam ${buildings.length} bina bulundu.`);

        for (const building of buildings) {
            if (building.imageUrl && !building.imageUrl.includes('supabase')) {
                try {
                    // Görseli indir
                    const imageResponse = await fetch(building.imageUrl);
                    const blob = await imageResponse.blob();

                    // Dosya adını oluştur
                    const timestamp = Date.now();
                    const fileExt = building.imageUrl.split('.').pop();
                    const fileName = `building_${building.id}_${timestamp}.${fileExt}`;
                    const filePath = `buildings/${fileName}`;

                    // Supabase'e yükle
                    const { data, error } = await supabase.storage
                        .from('buildings')
                        .upload(filePath, blob, {
                            contentType: `image/${fileExt}`,
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        throw error;
                    }

                    // Public URL'i al
                    const { data: { publicUrl } } = supabase.storage
                        .from('buildings')
                        .getPublicUrl(filePath);

                    // Veritabanını güncelle
                    await axios.put(
                        API_ENDPOINTS.ADMIN.BUILDINGS.UPDATE(building.id),
                        { imageUrl: publicUrl }
                    );

                    console.log(`✅ Bina ID ${building.id} için görsel başarıyla taşındı.`);
                } catch (error) {
                    console.error(`❌ Bina ID ${building.id} için görsel taşıma hatası:`, error);
                }
            }
        }

        console.log('Migrasyon tamamlandı!');
    } catch (error) {
        console.error('Migrasyon hatası:', error);
    }
};

// Migrasyonu başlat
migrateImages(); 