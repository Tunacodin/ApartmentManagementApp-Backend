using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Payment : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ApartmentId { get; set; }
        public PaymentType PaymentType { get; set; } = PaymentType.rent;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public string? Description { get; set; }
    }
}