namespace Entities.DTOs
{
    // Temel Bina DTO'su
    public class BuildingDto
    {
        public int Id { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int NumberOfFloors { get; set; }
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public string Address { get; set; } = string.Empty;
        public decimal DuesAmount { get; set; }
        public int AdminId { get; set; }
    }

    // Detaylı Bina DTO'su
    public class BuildingDetailDto
    {
        public int Id { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int NumberOfFloors { get; set; }
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }

        // Adres Bilgileri
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;

        // Finansal Bilgiler
        public decimal DuesAmount { get; set; }
        public bool IncludedElectric { get; set; }
        public bool IncludedWater { get; set; }
        public bool IncludedGas { get; set; }
        public bool IncludedInternet { get; set; }

        // Özellikler
        public BuildingFeaturesDto Features { get; set; } = new();

        // Yönetim Bilgileri
        public int AdminId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    // Bina Özellikleri DTO'su
    public class BuildingFeaturesDto
    {
        public string ParkingType { get; set; } = string.Empty;
        public bool HasElevator { get; set; }
        public bool HasPlayground { get; set; }
        public string HeatingType { get; set; } = string.Empty;
        public string PoolType { get; set; } = string.Empty;
        public bool HasGym { get; set; }
        public int BuildingAge { get; set; }
        public bool HasGarden { get; set; }
        public bool HasThermalInsulation { get; set; }
    }

    // Liste Görünümü DTO'su
    public class BuildingListDto
    {
        public int Id { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}