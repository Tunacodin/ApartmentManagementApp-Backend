using Core.Concrete;

namespace Entities.Concrete
{
    public class Meeting : IEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public int BuildingId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsCancelled { get; set; }
        public string CancellationReason { get; set; } = string.Empty;
    }
}