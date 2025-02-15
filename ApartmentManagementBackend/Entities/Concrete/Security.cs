using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Security : User
    {
        public Security()
        {
            Role = UserRole.security.ToString();
        }

        public int BuildingId { get; set; }
        public string ShiftHours { get; set; } = string.Empty;      // Örn: "09:00-17:00"
        public string Location { get; set; } = string.Empty;        // Güvenliğin konumu/bölgesi

        // Navigation property
        public Building? Building { get; set; }
    }
}