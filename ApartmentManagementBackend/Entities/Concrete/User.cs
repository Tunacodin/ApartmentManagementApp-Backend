using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class User : IEntity
    {
        public User()
        {
            Role = UserRole.tenant.ToString(); // Default role
        }

        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool EmailVerified { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsActive { get; set; }

        // Profil bilgileri
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
        public DateTime? ProfileUpdatedAt { get; set; }
    }
}