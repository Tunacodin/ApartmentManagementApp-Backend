using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // 🔹 Temel Güvenlik DTO'su (Ekleme/Güncelleme İçin)
    public class SecurityDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "security";
        public bool IsActive { get; set; } = true;
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        // Güvenlik Özel Bilgileri
        public string BadgeNumber { get; set; } = string.Empty;
        public string ShiftSchedule { get; set; } = string.Empty;
    }

    // 🔹 Güvenlik Liste DTO'su (Genel Liste Görünümü İçin)
    public class SecurityListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string BadgeNumber { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string CurrentShift { get; set; } = string.Empty;
        public List<string> AssignedBuildingNames { get; set; } = new();
    }

    // 🔹 Güvenlik Detay DTO'su (Tam Detay Görünümü İçin)
    public class SecurityDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        // Güvenlik Detayları
        public string BadgeNumber { get; set; } = string.Empty;
        public string ShiftSchedule { get; set; } = string.Empty;
        public List<SecurityBuildingAssignmentDto> AssignedBuildings { get; set; } = new();
        public List<SecurityShiftDto> UpcomingShifts { get; set; } = new();
        public List<SecurityIncidentDto> RecentIncidents { get; set; } = new();
    }

    // 🔹 Güvenlik Görev Yeri DTO'su
    public class SecurityBuildingAssignmentDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int TotalApartments { get; set; }
        public int TotalResidents { get; set; }
        public List<string> EmergencyContacts { get; set; } = new();
    }

    // 🔹 Güvenlik Vardiya DTO'su
    public class SecurityShiftDto
    {
        public DateTime ShiftDate { get; set; }
        public string ShiftTime { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    // 🔹 Güvenlik Olay DTO'su
    public class SecurityIncidentDto
    {
        public int Id { get; set; }
        public DateTime IncidentDate { get; set; }
        public string IncidentType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ActionTaken { get; set; } = string.Empty;
    }

    // 🔹 Güvenlik Rapor DTO'su
    public class SecurityReportDto
    {
        public int SecurityId { get; set; }
        public string SecurityName { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public string ShiftTime { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public List<SecurityIncidentDto> Incidents { get; set; } = new();
        public List<string> Observations { get; set; } = new();
        public string GeneralNotes { get; set; } = string.Empty;
    }

    // 🔹 Güvenlik Dashboard DTO'su
    public class SecurityDashboardDto
    {
        public List<SecurityShiftDto> TodayShifts { get; set; } = new();
        public List<SecurityIncidentDto> RecentIncidents { get; set; } = new();
        public List<SecurityBuildingAssignmentDto> AssignedBuildings { get; set; } = new();
        public int TotalIncidentsThisMonth { get; set; }
        public int PendingReports { get; set; }
        public DateTime NextShiftDate { get; set; }
        public List<string> ImportantAnnouncements { get; set; } = new();
    }
}