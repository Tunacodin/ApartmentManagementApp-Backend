using Core.Concrete;

namespace Entities.Concrete
{
    public class Apartment : IEntity
    {
        public Apartment()
        {
            OwnerApartments = new List<OwnerApartment>();
            Payments = new List<Payment>();
            Type = string.Empty;
            Notes = string.Empty;
            Status = string.Empty;
        }

        public int Id { get; set; }
        public int BuildingId { get; set; }
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

        // Navigation properties
        public Building? Building { get; set; }
        public List<OwnerApartment> OwnerApartments { get; set; } = new List<OwnerApartment>();
        public List<Payment> Payments { get; set; } = new List<Payment>();
        public Tenant? CurrentTenant { get; set; }
    }
}