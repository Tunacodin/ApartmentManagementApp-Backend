using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Concrete
{
    public class Notification : IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CreatedByAdminId { get; set; }
        public int BuildingId { get; set; }

        // Navigation properties
        public Admin? CreatedByAdmin { get; set; }  // 1-1 ilişki: Her duyurunun bir oluşturucusu var
        public Building? Building { get; set; }     // 1-1 ilişki: Hangi binaya ait duyuru
        public List<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();  // n-n ilişki: Kullanıcı-duyuru ilişkisi
    }
} 