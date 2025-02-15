using Core.Concrete;

namespace Entities.Concrete
{
    public class Building : IEntity
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int NumberOfFloors { get; set; }
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public decimal DuesAmount { get; set; }
        public bool IncludedElectric { get; set; }
        public bool IncludedWater { get; set; }
        public bool IncludedGas { get; set; }
        public bool IncludedInternet { get; set; }
        public int AdminId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ImageId { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Navigation properties
        public Admin? Admin { get; set; }
        public List<Apartment> Apartments { get; set; } = new List<Apartment>();
        public BuildingFeatures? Features { get; set; }
        public List<Meeting> Meetings { get; set; } = new List<Meeting>();
        public List<Notification> Notifications { get; set; } = new List<Notification>();
        public List<Complaint> Complaints { get; set; } = new List<Complaint>();
    }
}
