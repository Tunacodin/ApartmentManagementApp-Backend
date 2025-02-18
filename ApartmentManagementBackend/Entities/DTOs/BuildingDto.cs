
namespace Entities.DTOs
{
    public class BuildingDto 
    {
        // Basic Information
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int NumberOfFloors { get; set; }
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }

        // Address Information
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;

        // Financial Information
        public decimal DuesAmount { get; set; }
        public bool IncludedElectric { get; set; }
        public bool IncludedWater { get; set; }
        public bool IncludedGas { get; set; }
        public bool IncludedInternet { get; set; }

        // Management Information
        public int AdminId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ImageId { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}