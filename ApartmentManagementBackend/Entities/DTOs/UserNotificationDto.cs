namespace Entities.DTOs
{
    public class UserNotificationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int NotificationId { get; set; }
        public string NotificationTitle { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
} 