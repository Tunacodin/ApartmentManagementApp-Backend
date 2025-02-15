public class UserNotification : IEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int NotificationId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public Notification? Notification { get; set; }
} 