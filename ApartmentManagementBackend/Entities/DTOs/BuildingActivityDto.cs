using System;

namespace Entities.DTOs
{
    public class BuildingActivityDto
    {
        public int Id { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
        public string RelatedEntity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
    }
}