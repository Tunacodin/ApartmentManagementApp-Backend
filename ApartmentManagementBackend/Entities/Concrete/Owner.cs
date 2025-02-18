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
    }
}