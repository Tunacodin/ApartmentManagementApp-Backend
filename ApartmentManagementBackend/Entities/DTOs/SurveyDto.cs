using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Entities.DTOs
{
    // Temel Survey DTO'su
    public class SurveyDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int Status { get; set; }
        public int BuildingId { get; set; }
        public int TotalResponses { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime CreatedDate { get; set; }
        public string BuildingName { get; set; }
        public string CreatedByName { get; set; }
        public string CreatedByAdminName { get; set; }
        public string ProfileImageUrl { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
        public Dictionary<string, object> Results { get; set; }
    }

    // Survey Oluşturma DTO'su
    public class SurveyCreateDto
    {
        [Required(ErrorMessage = "Başlık alanı zorunludur.")]
        [StringLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Açıklama alanı zorunludur.")]
        [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi zorunludur.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Bitiş tarihi zorunludur.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "En az bir bina seçilmelidir.")]
        public List<int> BuildingIds { get; set; }

        [Required(ErrorMessage = "En az bir soru eklenmelidir.")]
        public List<SurveyQuestionDto> Questions { get; set; }
    }

    // Survey Soru DTO'su
    public class SurveyQuestionDto
    {
        public string? QuestionId { get; set; }

        [Required(ErrorMessage = "Soru metni zorunludur.")]
        [StringLength(500, ErrorMessage = "Soru metni en fazla 500 karakter olabilir.")]
        public string QuestionText { get; set; }

        [Required(ErrorMessage = "Soru tipi zorunludur.")]
        [Range(0, 10, ErrorMessage = "Geçersiz soru tipi.")]
        public int QuestionType { get; set; }

        [Required]
        public bool IsRequired { get; set; }

        public List<string>? Options { get; set; }

        public List<string>? Answers { get; set; }
    }

    // Survey Yanıt DTO'su
    public class SurveyResponseSummaryDto
    {
        public int SurveyId { get; set; }
        public int TotalResponses { get; set; }
        public Dictionary<string, Dictionary<string, int>> QuestionResponses { get; set; }
    }

    // Survey İstatistik DTO'su
    public class SurveyStatisticsDto
    {
        public int TotalResponses { get; set; }
        public double CompletionRate { get; set; }
        public Dictionary<string, Dictionary<string, int>> QuestionStatistics { get; set; }
        public List<string> PopularAnswers { get; set; }
        public DateTime LastResponseDate { get; set; }
    }

    // Survey Güncelleme DTO'su
    public class SurveyUpdateDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
    }
}