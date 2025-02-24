namespace Entities.DTOs
{
    public class ComplaintCreateDto
    {
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int BuildingId { get; set; }
    }
} 