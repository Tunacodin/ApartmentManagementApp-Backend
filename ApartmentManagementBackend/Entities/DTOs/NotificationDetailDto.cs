using System;

namespace Entities.DTOs
{
    public class NotificationDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string CreatedByAdminName { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
} 