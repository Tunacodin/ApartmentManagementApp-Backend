
namespace Entities.DTOs
{
    public class BuildingFeaturesDto 
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;

        // Building Features
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
}