using System;

namespace Entities.DTOs
{
    public class ComplaintDetailDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
    }
} 