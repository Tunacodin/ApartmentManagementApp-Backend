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

    // Navigation properties
    public User? User { get; set; }             // 1-1 ilişki: Her şikayetin bir sahibi var
    public Building? Building { get; set; }      // 1-1 ilişki: Hangi binaya ait şikayet
    public Admin? ResolvedByAdmin { get; set; }  // 1-1 ilişki: Şikayeti çözen admin
} 