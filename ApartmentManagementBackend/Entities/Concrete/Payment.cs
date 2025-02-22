using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Payment : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BuildingId { get; set; }
        public int? CardInfoId { get; set; }
        public int ApartmentId { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public string? Description { get; set; }
        public string UserFullName { get; set; } = string.Empty;
    }
}