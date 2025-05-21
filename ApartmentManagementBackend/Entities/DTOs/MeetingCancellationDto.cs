using System.ComponentModel.DataAnnotations;

namespace Entities.DTOs
{
    public class MeetingCancellationDto
    {
        [Required(ErrorMessage = "İptal nedeni gereklidir.")]
        public string Reason { get; set; }
    }
}