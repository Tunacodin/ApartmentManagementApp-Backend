using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class CardInfo : IEntity
    {
        public CardInfo()
        {
            CardNumber = string.Empty;
            PaymentType = string.Empty;
        }

        public int Id { get; set; }
        public int UserId { get; set; }
        public int ApartmentId { get; set; }
        public string CardNumber { get; set; }      // Encrypted
        public string PaymentType { get; set; }     // rent, aidat
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public bool IsPaid { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Apartment? Apartment { get; set; }
    }
}

