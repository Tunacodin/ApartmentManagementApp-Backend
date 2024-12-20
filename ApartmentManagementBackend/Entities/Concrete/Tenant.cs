using Core.Concrete;

namespace Entities.Concrete
{
    public class Tenant:IEntity
    {
        public int TenantId { get; set; }
        public int UserId { get; set; }
        public int BuildingId { get; set; }
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
