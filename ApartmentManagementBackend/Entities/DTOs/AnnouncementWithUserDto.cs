using System;

namespace Entities.DTOs
{
    public class AnnouncementWithUserDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UserFullName { get; set; }
        public string ProfileImageUrl { get; set; }
    }
}