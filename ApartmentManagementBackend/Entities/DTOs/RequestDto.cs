using System;

namespace Entities.DTOs
{
    public class RequestDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int BuildingId { get; set; }
        public int ApartmentId { get; set; }
        public int UserId { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }
}