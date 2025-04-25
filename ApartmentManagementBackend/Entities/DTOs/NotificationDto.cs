using System;

namespace Entities.DTOs
{
    // Temel Bildirim DTO'su
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public bool IsRead { get; set; }
        public string NotificationType { get; set; } = string.Empty;
        public int UserId { get; set; }
    }

    // Detay DTO'su
    public class NotificationDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CreatedByAdminId { get; set; }
        public string AdminFullName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    // Liste Görünümü DTO'su
    public class NotificationListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string AdminFullName { get; set; } = string.Empty;
    }

    // Kullanıcı Bildirimi DTO'su
    public class UserNotificationDto
    {
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}