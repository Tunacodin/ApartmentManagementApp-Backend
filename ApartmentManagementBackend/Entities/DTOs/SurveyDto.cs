using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // Temel Survey DTO'su
    public class SurveyDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int BuildingId { get; set; }
        public int TotalResponses { get; set; }
    }

    // Survey Oluşturma DTO'su
    public class SurveyCreateDto
    {
        public SurveyCreateDto()
        {
            Questions = new List<SurveyQuestionDto>();
        }

        public required string Title { get; set; }
        public required string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int BuildingId { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
    }

    // Survey Detay DTO'su
    public class SurveyDetailDto : SurveyDto
    {
        public SurveyDetailDto()
        {
            CreatedByAdminName = "Bilinmeyen Admin";
            BuildingName = "Bilinmeyen Bina";
            Questions = new List<SurveyQuestionDto>();
            Results = new Dictionary<string, object>();
        }

        public string CreatedByAdminName { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
        public Dictionary<string, object> Results { get; set; }
        public string BuildingName { get; set; }
    }

    // Survey Soru DTO'su
    public class SurveyQuestionDto
    {
        public SurveyQuestionDto()
        {
            Options = new List<string>();
        }

        public required string QuestionId { get; set; }
        public required string QuestionText { get; set; }
        public required string QuestionType { get; set; } // multiple_choice, text, rating
        public List<string> Options { get; set; }
        public bool IsRequired { get; set; }
    }

    // Survey Yanıt DTO'su
    public class SurveyResponseDto
    {
        public SurveyResponseDto()
        {
            Answers = new Dictionary<string, object>();
        }

        public int SurveyId { get; set; }
        public int UserId { get; set; }
        public DateTime SubmittedAt { get; set; }
        public Dictionary<string, object> Answers { get; set; }
    }

    // Survey İstatistik DTO'su
    public class SurveyStatisticsDto
    {
        public SurveyStatisticsDto()
        {
            QuestionStatistics = new Dictionary<string, Dictionary<string, int>>();
            PopularAnswers = new List<string>();
        }

        public int TotalResponses { get; set; }
        public double CompletionRate { get; set; }
        public Dictionary<string, Dictionary<string, int>> QuestionStatistics { get; set; }
        public List<string> PopularAnswers { get; set; }
        public DateTime LastResponseDate { get; set; }
    }

    // Survey Güncelleme DTO'su
    public class SurveyUpdateDto
    {
        public SurveyUpdateDto()
        {
            Questions = new List<SurveyQuestionDto>();
        }

        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
    }
}