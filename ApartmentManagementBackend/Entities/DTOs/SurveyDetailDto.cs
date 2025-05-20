using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    public class SurveyDetailDto : SurveyDto
    {
        public string BuildingName { get; set; }
        public string CreatedByAdminName { get; set; }
        public List<SurveyQuestionDto> Questions { get; set; }
        public Dictionary<string, object> Results { get; set; }
    }
}