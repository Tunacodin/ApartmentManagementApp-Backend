# Bina ve Daire Oluşturma API Dokümantasyonu

## API Endpoints

### 1. Bina Oluşturma
```http
POST /api/Building
```

#### Request Body
```typescript
interface BuildingCreateDto {
  name: string;              // Zorunlu: Bina adı
  address: string;           // Zorunlu: Bina adresi
  totalFloors: number;       // Zorunlu: Toplam kat sayısı
  totalApartments: number;   // Zorunlu: Toplam daire sayısı
  yearBuilt?: number;        // Opsiyonel: İnşa yılı
  description?: string;      // Opsiyonel: Bina açıklaması
  amenities?: string[];      // Opsiyonel: Bina özellikleri
  imageUrl?: string;         // Opsiyonel: Bina fotoğrafı
  managerId?: number;        // Opsiyonel: Bina yöneticisi ID
}
```

#### Response
```typescript
interface BuildingResponse {
  data: {
    id: number;
    name: string;
    address: string;
    totalFloors: number;
    totalApartments: number;
    yearBuilt?: number;
    description?: string;
    amenities?: string[];
    imageUrl?: string;
    managerId?: number;
    createdAt: string;
    updatedAt: string;
  };
  success: boolean;
  message: string;
}
```

### 2. Daire Oluşturma
```http
POST /api/Apartment/bulk
```

#### Request Body
```typescript
interface ApartmentBulkCreateDto {
  buildingId: number;        // Zorunlu: Bina ID
  apartments: {
    floorNumber: number;     // Zorunlu: Kat numarası
    apartmentNumber: string; // Zorunlu: Daire numarası
    size?: number;           // Opsiyonel: Daire büyüklüğü (m²)
    type?: string;           // Opsiyonel: Daire tipi (1+1, 2+1 vb.)
    isOccupied?: boolean;    // Opsiyonel: Dolu mu?
    notes?: string;          // Opsiyonel: Notlar
  }[];
}
```

#### Response
```typescript
interface ApartmentBulkResponse {
  data: {
    successCount: number;
    failedCount: number;
    apartments: {
      id: number;
      floorNumber: number;
      apartmentNumber: string;
      size?: number;
      type?: string;
      isOccupied: boolean;
      notes?: string;
      createdAt: string;
    }[];
  };
  success: boolean;
  message: string;
}
```

## 🔹 Tenant Endpoints

### Get Tenant Details
```http
GET /api/tenant/{id}
```

**Response:**
```json
{
  "data": {
    "id": 13,
    "fullName": "Hüseyin Bozkurt",
    "email": "tenant9@example.com",
    "phoneNumber": "0538000009",
    "isActive": true,
    "profileImageUrl": "https://randomuser.me/api/portraits/men/13.jpg",
    "apartmentId": 12,
    "buildingName": "Sky Tower",
    "unitNumber": 109,
    "leaseStartDate": "2024-01-01T00:00:00",
    "leaseEndDate": "2025-01-01T00:00:00",
    "monthlyRent": 5000,
    "monthlyDues": 500,
    "lastPaymentDate": "2024-03-06T00:00:00",
    "apartmentNumber": 109,
    "buildingId": 1,
    "adminName": "Fatma Çelik",
    "adminPhone": "05387227258",
    "adminEmail": "tuna.bostanci@example.com",
    "ownerName": "Ahmet Yılmaz",
    "ownerPhone": "05380000001",
    "ownerEmail": "owner@example.com",
    "depositAmount": 10000,
    "contractStatus": "Active",
    "remainingDays": 270,
    "remainingMonths": 9,
    "daysUntilNextRent": 25
  },
  "success": true,
  "message": "Kiracı bilgileri getirildi"
}
```

### Get Tenant Dashboard
```http
GET /api/tenant/dashboard/{id}
```

**Response:**
```json
{
  "data": {
    "profile": {
      "id": 13,
      "fullName": "Hüseyin Bozkurt",
      "email": "tenant9@example.com",
      "phoneNumber": "0538000009",
      "profileImageUrl": "https://randomuser.me/api/portraits/men/13.jpg",
      "isActive": true,
      "apartmentId": 12,
      "apartmentNumber": "109",
      "buildingId": 1,
      "buildingName": "Sky Tower",
      "buildingAddress": "Atatürk Cad. No:1 Kadıköy/İstanbul",
      "leaseStartDate": "2024-01-01T00:00:00",
      "leaseEndDate": "2025-01-01T00:00:00",
      "monthlyRent": 5000,
      "monthlyDues": 500,
      "totalPayments": 3,
      "pendingPayments": 1,
      "totalComplaints": 2,
      "activeComplaints": 1,
      "totalMeetings": 5,
      "upcomingMeetings": 2,
      "recentPayments": [...],
      "recentComplaints": [...],
      "upcomingMeetingsList": [...],
      "adminName": "Fatma Çelik",
      "adminPhone": "05387227258",
      "adminEmail": "tuna.bostanci@example.com",
      "ownerName": "Ahmet Yılmaz",
      "ownerPhone": "05380000001",
      "ownerEmail": "owner@example.com"
    },
    "contract": {
      "startDate": "2024-01-01T00:00:00",
      "endDate": "2025-01-01T00:00:00",
      "remainingDays": 270,
      "remainingMonths": 9,
      "monthlyRent": 5000,
      "monthlyDues": 500,
      "contractStatus": "Active",
      "daysUntilNextRent": 25
    },
    "apartment": {
      "id": 12,
      "unitNumber": 109,
      "floor": 3,
      "type": "2+1",
      "rentAmount": 5000,
      "depositAmount": 10000,
      "hasBalcony": true,
      "notes": "Güney cephe",
      "status": "occupied",
      "createdAt": "2024-01-01T00:00:00",
      "isActive": true,
      "isOccupied": true
    },
    "building": {
      "id": 1,
      "buildingName": "Sky Tower",
      "city": "İstanbul",
      "district": "Kadıköy",
      "neighborhood": "Caferağa",
      "street": "Atatürk Cad.",
      "buildingNumber": "1",
      "postalCode": "34710",
      "hasElevator": true,
      "hasPlayground": true,
      "hasGarden": true,
      "parkingType": "Underground",
      "heatingType": "Central",
      "poolType": "Indoor",
      "buildingAge": 5,
      "includedServices": ["Elektrik", "Su", "Doğalgaz", "İnternet"]
    },
    "admin": {
      "fullName": "Fatma Çelik",
      "email": "tuna.bostanci@example.com",
      "phoneNumber": "05387227258"
    },
    "owner": {
      "fullName": "Ahmet Yılmaz",
      "email": "owner@example.com",
      "phoneNumber": "05380000001",
      "iban": "TR123456789012345678901234",
      "bankName": "Garanti Bankası"
    },
    "paymentSummary": {
      "currentBalance": 5500,
      "currentPenalty": 55,
      "nextPaymentAmount": 5500,
      "nextPaymentDate": "2024-04-01T00:00:00",
      "hasOverduePayments": true,
      "totalPaidAmount": 16500,
      "totalPendingAmount": 5500
    },
    "recentPayments": [...],
    "recentPenalties": [...],
    "upcomingMeetings": [...],
    "activeSurveys": [...],
    "recentComplaints": [...],
    "notifications": [...]
  },
  "success": true,
  "message": "Kiracı dashboard bilgileri getirildi"
}
```

### Get Tenant Activities
```http
GET /api/tenant/activities/{id}
```

**Response:**
```json
{
  "data": {
    "paymentHistory": [
      {
        "id": 1,
        "userId": 13,
        "userFullName": "Hüseyin Bozkurt",
        "paymentType": "rent",
        "amount": 5000,
        "paymentDate": "2024-03-01T00:00:00",
        "dueDate": "2024-03-01T00:00:00",
        "isPaid": true,
        "description": "Mart 2024 Kira Ödemesi",
        "delayedDays": null,
        "delayPenaltyAmount": null,
        "totalAmount": 5000
      }
    ],
    "pendingPayments": [
      {
        "id": 2,
        "userId": 13,
        "userFullName": "Hüseyin Bozkurt",
        "paymentType": "rent",
        "amount": 5000,
        "paymentDate": null,
        "dueDate": "2024-04-01T00:00:00",
        "isPaid": false,
        "description": "Nisan 2024 Kira Ödemesi",
        "delayedDays": 0,
        "delayPenaltyAmount": 0,
        "totalAmount": 5000
      }
    ],
    "upcomingPayments": [...],
    "meetingHistory": [...],
    "surveyHistory": [...],
    "complaintHistory": [...]
  },
  "success": true,
  "message": "Kiracı aktiviteleri getirildi"
}
```

### Get Tenant Notifications
```http
GET /api/tenant/notifications/{id}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Yeni Ödeme Hatırlatması",
      "message": "Nisan 2024 kira ödemesi yaklaşıyor",
      "createdDate": "2024-03-25T00:00:00",
      "isRead": false,
      "notificationType": "payment"
    }
  ],
  "success": true,
  "message": "Kiracı bildirimleri getirildi"
}
```

### Get Tenant Payments
```http
GET /api/tenant/payments/{id}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "paymentType": "rent",
      "amount": 5000,
      "paymentDate": "2024-03-01T00:00:00",
      "dueDate": "2024-03-01T00:00:00",
      "isPaid": true,
      "description": "Mart 2024 Kira Ödemesi",
      "delayedDays": null,
      "delayPenaltyAmount": null,
      "totalAmount": 5000
    }
  ],
  "success": true,
  "message": "Kiracı ödemeleri getirildi"
}
```

### Make Payment
```http
POST /api/tenant/payment/{id}
```

**Request Body:**
```json
{
  "paymentId": 1,
  "amount": 5000,
  "paymentMethod": "credit_card",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

**Response:**
```json
{
  "data": {
    "paymentId": 1,
    "amount": 5000,
    "paymentDate": "2024-03-25T00:00:00",
    "paymentType": "rent",
    "isSuccessful": true,
    "delayedDays": 0,
    "delayPenaltyAmount": 0,
    "totalAmount": 5000
  },
  "success": true,
  "message": "Ödeme başarıyla gerçekleştirildi"
}
```

### Create Complaint
```http
POST /api/tenant/complaint/{id}
```

**Request Body:**
```json
{
  "title": "Su Tesisatı Arızası",
  "description": "Banyo su tesisatında sızıntı var"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Su Tesisatı Arızası",
    "description": "Banyo su tesisatında sızıntı var",
    "createdAt": "2024-03-25T00:00:00",
    "status": 0,
    "isResolved": false,
    "isInProgress": false
  },
  "success": true,
  "message": "Şikayet başarıyla oluşturuldu"
}
```

### Submit Survey Response
```http
POST /api/tenant/survey/{id}
```

**Request Body:**
```json
{
  "surveyId": 1,
  "responses": {
    "1": "Evet",
    "2": "Hayır",
    "3": "Bazen"
  }
}
```

**Response:**
```json
{
  "data": {
    "surveyId": 1,
    "responseDate": "2024-03-25T00:00:00",
    "responses": {
      "1": "Evet",
      "2": "Hayır",
      "3": "Bazen"
    }
  },
  "success": true,
  "message": "Anket yanıtları başarıyla kaydedildi"
}
```

## Expo Uygulama Yapısı

### Form Yapısı
```typescript
// BuildingForm.tsx
interface BuildingFormState {
  // Bina Bilgileri
  name: string;
  address: string;
  totalFloors: number;
  totalApartments: number;
  yearBuilt?: number;
  description?: string;
  amenities: string[];
  imageUrl?: string;
  
  // Daire Bilgileri
  apartments: {
    floorNumber: number;
    apartmentNumber: string;
    size?: number;
    type?: string;
    isOccupied: boolean;
    notes?: string;
  }[];
}

// Form Adımları
enum FormStep {
  BUILDING_INFO = 'BUILDING_INFO',
  APARTMENT_SETUP = 'APARTMENT_SETUP',
  REVIEW = 'REVIEW'
}
```

### API İstekleri
```typescript
// buildingApi.ts
const createBuilding = async (buildingData: BuildingCreateDto) => {
  const response = await axios.post('/api/Building', buildingData);
  return response.data;
};

const createApartments = async (apartmentsData: ApartmentBulkCreateDto) => {
  const response = await axios.post('/api/Apartment/bulk', apartmentsData);
  return response.data;
};
```

### Form Akışı
```typescript
// BuildingCreationFlow.tsx
const BuildingCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BUILDING_INFO);
  const [formData, setFormData] = useState<BuildingFormState>({
    // ... initial state
  });

  const handleBuildingSubmit = async () => {
    try {
      // 1. Bina oluştur
      const buildingResponse = await createBuilding({
        name: formData.name,
        address: formData.address,
        totalFloors: formData.totalFloors,
        totalApartments: formData.totalApartments,
        // ... diğer bina bilgileri
      });

      // 2. Daireleri oluştur
      const apartmentsResponse = await createApartments({
        buildingId: buildingResponse.data.id,
        apartments: formData.apartments
      });

      // 3. Başarılı mesajı göster
      showSuccessMessage('Bina ve daireler başarıyla oluşturuldu');
      
    } catch (error) {
      showErrorMessage('Bir hata oluştu');
    }
  };
};
```

## Önemli Notlar

### 1. Validasyonlar
- Bina adı ve adresi boş olamaz
- Kat sayısı ve daire sayısı 0'dan büyük olmalı
- Daire numaraları benzersiz olmalı
- Kat numarası, toplam kat sayısından büyük olamaz

### 2. Hata Yönetimi
- API isteklerinde try-catch kullanılmalı
- Kullanıcıya anlamlı hata mesajları gösterilmeli
- İşlem başarısız olursa form verileri korunmalı

### 3. Kullanıcı Deneyimi
- Form adımları arasında geçiş yapılabilmeli
- İlerleme durumu gösterilmeli
- Yükleniyor durumları belirtilmeli
- Başarılı/başarısız durumlar için bildirimler gösterilmeli

### 4. Güvenlik
- API isteklerinde authentication token kullanılmalı
- Kullanıcı yetkileri kontrol edilmeli
- Hassas veriler şifrelenmeli

### 5. Performans
- Büyük veri setleri için sayfalama kullanılmalı
- Gereksiz API çağrılarından kaçınılmalı
- Form verileri local state'te tutulmalı 