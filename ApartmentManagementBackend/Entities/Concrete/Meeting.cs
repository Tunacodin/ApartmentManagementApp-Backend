using Core.Concrete;

namespace Entities.Concrete
{
    public class Meeting : IEntity
    {
        public int Id { get; set; }
        public DateTime MeetingDate { get; set; }
        public string Agenda { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public int CreatedByAdminId { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public Admin? CreatedByAdmin { get; set; }  // 1-1 ilişki: Her toplantının bir oluşturucusu var
        public List<User> Participants { get; set; } = new List<User>();  // n-n ilişki: Toplantıya katılanlar
        public Building? Building { get; set; }     // 1-1 ilişki: Hangi binaya ait toplantı
    }
} 