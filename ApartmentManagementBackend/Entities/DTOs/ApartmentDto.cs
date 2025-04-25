namespace Entities.DTOs
{
    // 🔹 Temel Daire DTO'su (Ekleme/Güncelleme İçin)
    public class ApartmentDto
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public int OwnerId { get; set; }
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public bool HasBalcony { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    // 🔹 Daire Liste DTO'su (Genel Liste Görünümü İçin)
    public class ApartmentListDto
    {
        public int Id { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
    }

    // 🔹 Daire Detay DTO'su (Tam Detay Görünümü İçin)
    public class ApartmentDetailDto
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerContact { get; set; } = string.Empty;
        public string OwnerProfileImage { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public bool HasBalcony { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public ApartmentTenantDto? CurrentTenant { get; set; }
        public List<ApartmentPaymentDto> RecentPayments { get; set; } = new();
    }

    // 🔹 Kiracı Bilgi DTO'su
    public class ApartmentTenantDto
    {
        public int TenantId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
    }

    // 🔹 Ödeme DTO'su
    public class ApartmentPaymentDto
    {
        public int PaymentId { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public bool IsPaid { get; set; }
    }
}