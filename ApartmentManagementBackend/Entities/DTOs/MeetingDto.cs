using System;

namespace Entities.DTOs
{
    // Temel Toplantı DTO'su
    public class MeetingDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime MeetingDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Location { get; set; }
        public int Status { get; set; }
        public string OrganizedByName { get; set; }
        public string OrganizerImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int BuildingId { get; set; }
        public int TenantId { get; set; }
    }

    // Detay DTO'su
    public class MeetingDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int OrganizedById { get; set; }
        public string OrganizedByName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int Status { get; set; }
        public bool IsCancelled { get; set; }
        public string CancellationReason { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public List<MeetingParticipantDto> Participants { get; set; } = new();
    }

    // Liste Görünümü DTO'su
    public class MeetingListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public string OrganizedByName { get; set; } = string.Empty;
        public int Status { get; set; }
        public bool IsCancelled { get; set; }
    }

    // Katılımcı DTO'su
    public class MeetingParticipantDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool HasAttended { get; set; }
        public List<int> ParticipantIds { get; set; } = new();
    }
}