namespace Entities.DTOs
{
    public class MeetingDto
    {
        public int Id { get; set; }
        public DateTime MeetingDate { get; set; }
        public string Agenda { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public int CreatedByAdminId { get; set; }
        public string AdminFullName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public List<UserDto> Participants { get; set; } = new List<UserDto>();
        public bool IsActive { get; set; }
    }
} 