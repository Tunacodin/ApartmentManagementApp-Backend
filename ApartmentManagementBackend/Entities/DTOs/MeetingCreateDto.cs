using System;
using System.ComponentModel.DataAnnotations;

namespace Entities.DTOs
{
    public class MeetingCreateDto
    {
        [Required(ErrorMessage = "Bina ID'si gereklidir.")]
        public int BuildingId { get; set; }

        [Required(ErrorMessage = "Toplantı başlığı gereklidir.")]
        [StringLength(100, ErrorMessage = "Toplantı başlığı en fazla 100 karakter olabilir.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Toplantı tarihi gereklidir.")]
        public DateTime MeetingDate { get; set; }

        [Required(ErrorMessage = "Organizatör ID'si gereklidir.")]
        public int OrganizedById { get; set; }

        [Required(ErrorMessage = "Organizatör adı gereklidir.")]
        [StringLength(100, ErrorMessage = "Organizatör adı en fazla 100 karakter olabilir.")]
        public string OrganizedByName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Toplantı lokasyonu gereklidir.")]
        [StringLength(200, ErrorMessage = "Lokasyon en fazla 200 karakter olabilir.")]
        public string Location { get; set; } = string.Empty;
    }
}