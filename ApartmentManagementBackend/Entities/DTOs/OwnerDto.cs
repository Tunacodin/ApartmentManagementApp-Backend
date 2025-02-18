using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    public class OwnerDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool EmailVerified { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsActive { get; set; }

        // Owner'a özel alanlar
        public string IBAN { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;

        // İlişkili veriler
        public List<OwnerApartmentDto> OwnedApartments { get; set; } = new();
    }

    public class OwnerApartmentDto
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
    }
}