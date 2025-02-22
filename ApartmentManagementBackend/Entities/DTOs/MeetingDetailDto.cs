using System;

namespace Entities.DTOs
{
    public class MeetingDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsCancelled { get; set; }
        public string CancellationReason { get; set; } = string.Empty;
        public string OrganizedByName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }
} 