namespace Entities.DTOs.Complaint
{
    public class CreateComplaintRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}