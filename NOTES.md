# Şikayet Yönetimi Endpoint'leri

## Şikayetleri Listeleme
1. Admin'e ait tüm şikayetleri getirme:
```
GET /api/Complaint/admin/{adminId}
```
- Admin'in yönettiği tüm binalardaki şikayetleri getirir
- Şikayetler oluşturulma tarihine göre sıralanır
- Her şikayet için detaylı bilgileri döndürür (şikayet eden kişi, daire, durum vb.)

2. Binadaki bekleyen şikayetleri getirme:
```
GET /api/Complaint/building/{buildingId}/pending
```
- Belirtilen binadaki açık ve işlemdeki şikayetleri getirir
- Sadece çözülmemiş şikayetleri listeler

## Şikayet Durumu Güncelleme
1. Şikayeti işleme alma:
```
POST /api/Complaint/{id}/process?adminId={adminId}
```
- Şikayeti "İşlemde" durumuna getirir
- İşlemi yapan admin'i kaydeder
- Şikayet sahibine bildirim gönderir: "Şikayetiniz İşleme Alındı"

2. Şikayeti çözme:
```
POST /api/Complaint/{id}/resolve?adminId={adminId}
```
- Şikayeti "Çözüldü" durumuna getirir
- Çözülme tarihini ve admin'i kaydeder
- Şikayet sahibine bildirim gönderir: "Şikayetiniz Çözüldü"

3. Şikayeti reddetme:
```
POST /api/Complaint/{id}/reject?adminId={adminId}
Content-Type: application/json

{
    "reason": "Red sebebi"
}
```
- Şikayeti "Reddedildi" durumuna getirir
- Red tarihini, admin'i ve sebebini kaydeder
- Şikayet sahibine bildirim gönderir: "Şikayetiniz Reddedildi" (sebep ile birlikte)

## Şikayet Detayları
Her şikayet kaydında şu bilgiler bulunur:
- Şikayet ID'si
- Şikayet eden kişi bilgileri:
  - Ad Soyad
  - Profil resmi
  - Telefon
  - Email
- Daire numarası
- Şikayet başlığı ve açıklaması
- Oluşturulma tarihi
- Durum (Açık, İşlemde, Çözüldü, Reddedildi)
- Açık kalma süresi (gün cinsinden)
- İşlemi yapan admin bilgileri (çözülmüş/reddedilmiş ise)
- Çözülme/red tarihi (çözülmüş/reddedilmiş ise)

## Durum Kodları
- 0: Açık (Yeni şikayet)
- 1: İşlemde (Admin tarafından alındı)
- 2: Çözüldü
- 3: Reddedildi

## Örnek Response
```json
{
  "success": true,
  "message": "Şikayetler başarıyla listelendi",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "buildingId": 456,
      "subject": "Asansör Arızası",
      "description": "Asansör 2. katta takılı kalıyor",
      "createdAt": "2024-03-20T10:30:00",
      "status": 0,
      "statusText": "Açık",
      "resolvedByAdminId": null,
      "resolvedAt": null,
      "createdByName": "John Doe",
      "profileImageUrl": "https://example.com/profile.jpg",
      "phoneNumber": "5551234567",
      "email": "john@example.com",
      "apartmentNumber": "101",
      "daysOpen": 5
    }
  ]
}
```

# Gecikmiş Ödemeler Endpoint'i

## Request
```
GET /api/Finance/overdue-payments
```

### Query Parametreleri
```json
{
  "buildingId": 1,          // Opsiyonel: Belirli bir binanın gecikmiş ödemeleri
  "startDate": "2024-03-01", // Opsiyonel: Başlangıç tarihi
  "endDate": "2024-03-31",   // Opsiyonel: Bitiş tarihi
  "pageNumber": 1,          // Opsiyonel: Sayfa numarası (varsayılan: 1)
  "pageSize": 10           // Opsiyonel: Sayfa başına kayıt (varsayılan: 10)
}
```

## Response
```json
{
  "success": true,
  "message": "Gecikmiş ödemeler başarıyla listelendi",
  "data": [
    {
      "paymentId": 123,
      "buildingName": "Yeşil Vadi Apartmanı",
      "apartmentNumber": "101",
      "tenantName": "Ahmet Yılmaz",
      "paymentType": "Kira",
      "originalAmount": 5000.00,
      "dueDate": "2024-03-01T00:00:00",
      "delayedDays": 20,
      "dailyPenaltyRate": 0.01,
      "penaltyAmount": 1000.00,
      "totalAmount": 6000.00
    },
    {
      "paymentId": 124,
      "buildingName": "Yeşil Vadi Apartmanı",
      "apartmentNumber": "102",
      "tenantName": "Mehmet Demir",
      "paymentType": "Aidat",
      "originalAmount": 500.00,
      "dueDate": "2024-03-05T00:00:00",
      "delayedDays": 16,
      "dailyPenaltyRate": 0.01,
      "penaltyAmount": 80.00,
      "totalAmount": 580.00
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 2,
    "totalPages": 1
  }
}
```

### Response Alanları
- `paymentId`: Ödeme ID'si
- `buildingName`: Bina adı
- `apartmentNumber`: Daire numarası
- `tenantName`: Kiracı adı
- `paymentType`: Ödeme türü (Kira, Aidat vb.)
- `originalAmount`: Orijinal ödeme tutarı
- `dueDate`: Vade tarihi
- `delayedDays`: Gecikme günü sayısı
- `dailyPenaltyRate`: Günlük ceza oranı
- `penaltyAmount`: Toplam ceza tutarı
- `totalAmount`: Toplam ödenecek tutar (orijinal + ceza)

### Hata Durumları
```json
{
  "success": false,
  "message": "Gecikmiş ödemeler alınırken bir hata oluştu",
  "data": null
}
```

### Örnek Kullanım
```javascript
// Axios ile örnek kullanım
const getOverduePayments = async () => {
  try {
    const response = await axios.get('/api/Finance/overdue-payments', {
      params: {
        buildingId: 1,
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        pageNumber: 1,
        pageSize: 10
      }
    });
    
    if (response.data.success) {
      const overduePayments = response.data.data;
      // Gecikmiş ödemeleri işle
    }
  } catch (error) {
    console.error('Gecikmiş ödemeler alınırken hata:', error);
  }
};
``` 