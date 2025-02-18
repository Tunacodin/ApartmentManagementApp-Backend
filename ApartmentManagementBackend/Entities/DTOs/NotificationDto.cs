namespace Entities.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CreatedByAdminId { get; set; }
        public string AdminFullName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public List<UserNotificationDto> UserNotifications { get; set; } = new List<UserNotificationDto>();
    }
} 