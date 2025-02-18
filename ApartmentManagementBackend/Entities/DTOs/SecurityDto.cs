using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    public class SecurityDto : UserDto
    {
        public string BadgeNumber { get; set; } = string.Empty;
        public string ShiftSchedule { get; set; } = string.Empty;
        public List<int> AssignedBuildingIds { get; set; } = new();
        public List<string> AssignedBuildingNames { get; set; } = new();
    }
}