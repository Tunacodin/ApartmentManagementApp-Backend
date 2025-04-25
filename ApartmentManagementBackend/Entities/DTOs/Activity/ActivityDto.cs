using System;

namespace Entities.DTOs.Activity
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public decimal? Amount { get; set; }
        public string Location { get; set; }
    }
}