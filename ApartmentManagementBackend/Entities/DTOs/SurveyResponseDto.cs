using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    public class SurveyResponseDto
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        public int QuestionId { get; set; }
        public string Answer { get; set; } = string.Empty;
        public int TenantId { get; set; }
        public DateTime ResponseDate { get; set; }
        public Dictionary<string, object> Answers { get; set; } = new Dictionary<string, object>();
    }
}