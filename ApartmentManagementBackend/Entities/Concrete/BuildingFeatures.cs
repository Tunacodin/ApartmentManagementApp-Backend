using Core.Concrete;

namespace Entities.Concrete
{
    public class BuildingFeatures : IEntity
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string ParkingType { get; set; } = string.Empty;     // open, closed, none
        public bool HasElevator { get; set; }
        public bool HasPlayground { get; set; }
        public string HeatingType { get; set; } = string.Empty;     // central, combi, floor
        public string PoolType { get; set; } = string.Empty;        // open, closed, none
        public bool HasGym { get; set; }
        public int BuildingAge { get; set; }
        public bool HasGarden { get; set; }
        public bool HasThermalInsulation { get; set; }

        // Navigation property
        public Building? Building { get; set; }
    }
}