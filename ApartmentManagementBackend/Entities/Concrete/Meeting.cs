using Core.Concrete;

namespace Entities.Concrete
{
    public class Meeting : IEntity
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int OrganizedById { get; set; }
        public string OrganizedByName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsCancelled { get; set; }
        public string CancellationReason { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
    }
}