using System;

namespace Entities.DTOs
{
    public class ComplaintWithUserDto
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime CreatedDate { get; set; }
        public int BuildingId { get; set; }
        public int UserId { get; set; }
        public int Status { get; set; }
        public string CreatedByName { get; set; }
        public string UserFullName { get; set; }
        public string ProfileImageUrl { get; set; }
    }
}