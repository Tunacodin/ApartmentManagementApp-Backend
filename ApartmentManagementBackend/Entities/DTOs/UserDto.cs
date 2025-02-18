namespace Entities.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public UserDetailsDto Details { get; set; } = new();
    }

    public class UserDetailsDto
    {
        // Owner detayları
        public string? IBAN { get; set; }
        public string? BankName { get; set; }

        // Security detayları
        public int? BuildingId { get; set; }
        public string? ShiftHours { get; set; }

        // Tenant detayları
        public int? ApartmentId { get; set; }
        public DateTime? LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal? MonthlyRent { get; set; }
    }
}