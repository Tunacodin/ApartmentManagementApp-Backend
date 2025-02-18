namespace Entities.DTOs
{
    public class AdminDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<int> BuildingIds { get; set; } = new List<int>();
        public List<int> CreatedMeetingIds { get; set; } = new List<int>();
        public List<int> AssignedApartmentIds { get; set; } = new List<int>();
        public List<int> CreatedNotificationIds { get; set; } = new List<int>();
        public List<int> ResolvedComplaintIds { get; set; } = new List<int>();
    }
}