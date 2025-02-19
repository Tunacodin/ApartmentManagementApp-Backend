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

        // Profil bilgileri
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
        public DateTime? ProfileUpdatedAt { get; set; }
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

    // Profil yönetimi için ayrı DTO
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
        public DateTime? ProfileUpdatedAt { get; set; }
    }

    // Profil güncelleme için DTO
    public class UpdateProfileDto
    {
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
    }
}