using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Owner : User
    {
        public Owner()
        {
            Role = UserRole.owner.ToString();
        }

        public string IBAN { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;

        // Navigation properties
        public List<OwnerApartment> OwnerApartments { get; set; } = new List<OwnerApartment>();
        public List<Payment> Payments { get; set; } = new List<Payment>();
        public List<Contract> Contracts { get; set; } = new List<Contract>();
    }
}