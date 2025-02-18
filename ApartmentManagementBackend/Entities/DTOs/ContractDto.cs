namespace Entities.DTOs
{
    public class ContractDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string TenantFullName { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public string OwnerFullName { get; set; } = string.Empty;
        public int ApartmentId { get; set; }
        public string ApartmentInfo { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RentAmount { get; set; }
        public string ContractFile { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
} 