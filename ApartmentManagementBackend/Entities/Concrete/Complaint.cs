using Core.Concrete;

public class Complaint : IEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BuildingId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsResolved { get; set; }
    public int? ResolvedByAdminId { get; set; }
    public DateTime? ResolvedAt { get; set; }
} 