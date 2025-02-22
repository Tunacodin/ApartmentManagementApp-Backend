using Core.Concrete;

namespace Entities.Concrete
{
    public class Complaint : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BuildingId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
        public bool IsInProgress { get; set; }
        public int? ResolvedByAdminId { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }
}