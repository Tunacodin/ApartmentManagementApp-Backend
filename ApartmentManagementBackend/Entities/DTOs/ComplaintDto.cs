namespace Entities.DTOs
{
    public class ComplaintDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
        public int? ResolvedByAdminId { get; set; }
        public string? AdminFullName { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
} 