namespace Entities.DTOs
{
    public class ApartmentDto
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public bool HasBalcony { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<int> OwnerIds { get; set; } = new List<int>();
        public List<int> TenantIds { get; set; } = new List<int>();
        public List<int> PaymentIds { get; set; } = new List<int>();
    }
} 