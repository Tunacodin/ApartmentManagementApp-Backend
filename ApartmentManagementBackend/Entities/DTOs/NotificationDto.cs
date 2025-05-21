using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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

    // Bildirim Oluşturma DTO'su
    public class NotificationCreateDto
    {
        [Required(ErrorMessage = "Bildirim başlığı gereklidir.")]
        [StringLength(100, ErrorMessage = "Başlık en fazla 100 karakter olabilir.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Bildirim mesajı gereklidir.")]
        [StringLength(500, ErrorMessage = "Mesaj en fazla 500 karakter olabilir.")]
        public string Message { get; set; } = string.Empty;

        [Required(ErrorMessage = "En az bir bina seçilmelidir.")]
        public List<int> BuildingIds { get; set; } = new();

        [Required(ErrorMessage = "Admin ID'si gereklidir.")]
        public int CreatedByAdminId { get; set; }
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
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }

    // Liste Görünümü DTO'su
    public class NotificationListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string AdminFullName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }

    // Kullanıcı Bildirimi DTO'su
    public class UserNotificationDto
    {
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }
}