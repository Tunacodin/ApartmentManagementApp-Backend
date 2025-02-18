using System;

namespace Entities.DTOs
{
    // 🔹 Temel Kiracı DTO'su (Ekleme/Güncelleme İçin)
    public class TenantDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "tenant"; // Varsayılan "tenant"
        public bool IsActive { get; set; } = true; // Varsayılan aktif
        public int ApartmentId { get; set; } // Artık nullable değil
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
    }

    // 🔹 Kiracı Listeleme DTO'su (Listeleme İçin)
    public class TenantListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int ApartmentId { get; set; } // Artık nullable değil
        public string BuildingName { get; set; } = string.Empty; // Apartman adı
        public int UnitNumber { get; set; } // Daire numarası
    }

    // 🔹 Kiracı Detay DTO'su (Detay Görüntüleme İçin)
    public class TenantDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int ApartmentId { get; set; } // Artık nullable değil
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
        public DateTime? LastPaymentDate { get; set; }
    }

    // 🔹 Ödeme Geçmişi DTO'su (Sadece Ödeme Listesi İçin)
    public class PaymentHistoryDto
    {
        public int Id { get; set; }
        public string PaymentType { get; set; } = string.Empty; // "rent" veya "aidat"
        public decimal Amount { get; set; } // Ödeme miktarı
        public DateTime PaymentDate { get; set; } // Ödeme tarihi
        public bool IsPaid { get; set; } // Ödeme yapıldı mı?
        public string Description { get; set; } = string.Empty; // Açıklama (örn. "Şubat 2024 Kira Ödemesi")
    }

    // 🔹 Kiracı + Ödemeler DTO'su (İsteğe Bağlı Olarak Ödemeler Dahil)
    public class TenantWithPaymentsDto : TenantDetailDto
    {
        public List<PaymentHistoryDto> Payments { get; set; } = new();
    }
}