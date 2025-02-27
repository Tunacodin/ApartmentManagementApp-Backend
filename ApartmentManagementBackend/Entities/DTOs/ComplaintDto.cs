namespace Entities.DTOs
{
    // Temel Şikayet DTO'su (Ekleme/Güncelleme için)
    public class ComplaintDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BuildingId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsResolved { get; set; }
        public bool IsInProgress { get; set; }
        public int? ResolvedByAdminId { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
    }

    // Şikayet Detay DTO'su (Detaylı görüntüleme için)
    public class ComplaintDetailDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
        public bool IsInProgress { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime? ResolvedAt { get; set; }
        public int BuildingId { get; set; }
        public string? ResolvedByAdminName { get; set; }
    }

    // Şikayet Oluşturma DTO'su (Yeni şikayet oluşturma için)
    public class ComplaintCreateDto
    {
        public int UserId { get; set; }
        public int BuildingId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Şikayet Liste DTO'su (Liste görünümü için)
    public class ComplaintListDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsResolved { get; set; }
        public bool IsInProgress { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
    }

    // Şikayet Güncelleme DTO'su (Durum güncellemesi için)
    public class ComplaintUpdateDto
    {
        public int Id { get; set; }
        public bool IsResolved { get; set; }
        public bool IsInProgress { get; set; }
        public int? ResolvedByAdminId { get; set; }
        public string? ResolutionNotes { get; set; }
    }
} 