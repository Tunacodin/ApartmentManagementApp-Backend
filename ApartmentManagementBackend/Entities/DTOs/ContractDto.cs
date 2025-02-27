namespace Entities.DTOs
{
    public class ContractDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int OwnerId { get; set; }
        public int ApartmentId { get; set; }
        public string TenantFullName { get; set; } = string.Empty;
        public string OwnerFullName { get; set; } = string.Empty;
        public string ApartmentInfo { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RentAmount { get; set; }
        public string ContractFile { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        
        // Hesaplanan alanlar
        public int CurrentMonth { get; set; }          // Kaçıncı ay
        public int RemainingMonths { get; set; }       // Kalan ay sayısı
        public bool IsExpiringSoon { get; set; }       // Son 2 ay kaldıysa true
        public decimal TotalContractValue { get; set; } // Toplam sözleşme değeri
    }
} 