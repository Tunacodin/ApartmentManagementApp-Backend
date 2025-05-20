using System;

namespace Entities.DTOs
{
    public class SurveyWithUserDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime EndDate { get; set; }
        public string UserFullName { get; set; }
        public string ProfileImageUrl { get; set; }
    }
}