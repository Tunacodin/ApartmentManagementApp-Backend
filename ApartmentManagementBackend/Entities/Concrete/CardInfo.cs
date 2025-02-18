using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class CardInfo : IEntity
    {
    
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ApartmentId { get; set; }
        public string CardNumber { get; set; } = string.Empty;     // Encrypted
        public string PaymentType { get; set; }= string.Empty;     // rent, aidat
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public bool IsPaid { get; set; }
    }
}

