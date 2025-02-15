using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class User : IEntity
    {
        protected User()
        {
            Role = UserRole.tenant.ToString(); // Default role
        }

        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool EmailVerified { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public List<UserNotification> Notifications { get; set; } = new List<UserNotification>();
        public List<Complaint> Complaints { get; set; } = new List<Complaint>();
    }
}