using Core.Concrete;

namespace Entities.Concrete
{
    public class Apartment : IEntity
    {

        public int Id { get; set; }
        public int BuildingId { get; set; }
        public int OwnerId { get; set; }
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public bool HasBalcony { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsOccupied { get; set; }


    }
}