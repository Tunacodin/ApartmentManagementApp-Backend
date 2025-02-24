using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // 🔹 Temel Admin DTO'su (Ekleme/Güncelleme İçin)
    public class AdminDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "admin";
        public bool IsActive { get; set; } = true;
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        public string Password { get; set; } = string.Empty;
    }

    // 🔹 Admin Liste DTO'su (Genel Liste Görünümü İçin)
    public class AdminListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<string> ManagedBuildingNames { get; set; } = new();
        public int TotalManagedBuildings { get; set; }
    }

    // 🔹 Admin Detay DTO'su (Tam Detay Görünümü İçin)
    public class AdminDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginDate { get; set; }

        // Yönetim İstatistikleri
        public List<AdminManagedBuildingDto> ManagedBuildings { get; set; } = new();
        public int TotalManagedApartments { get; set; }
        public int TotalResidents { get; set; }
        public int ActiveComplaints { get; set; }
        public int PendingPayments { get; set; }
        public int UpcomingMeetings { get; set; }
    }

    // 🔹 Yönetilen Bina DTO'su
    public class AdminManagedBuildingDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int TotalApartments { get; set; }
        public int OccupiedApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public decimal TotalDuesAmount { get; set; }
        public int ActiveComplaints { get; set; }
        public DateTime LastMaintenanceDate { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalPayments { get; set; }
        public int PendingPayments { get; set; }
    }

    // 🔹 Dashboard İstatistikleri DTO'su
    public class AdminDashboardDto
    {
        public int TotalBuildings { get; set; }
        public int TotalApartments { get; set; }
        public int TotalResidents { get; set; }
        public decimal TotalMonthlyIncome { get; set; }
        public int PendingComplaints { get; set; }
        public int UpcomingMeetings { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public List<FinancialSummaryDto> FinancialSummaries { get; set; } = new();
    }

    // 🔹 Yakın Zamanlı Aktivite DTO'su
    public class RecentActivityDto
    {
        public int Id { get; set; }
        public string ActivityType { get; set; } = string.Empty; // Complaint, Payment, Meeting, etc.
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
        public string RelatedUserName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    // 🔹 Finansal Özet DTO'su
    public class FinancialSummaryDto
    {
        public string BuildingName { get; set; } = string.Empty;
        public decimal ExpectedIncome { get; set; }
        public decimal CollectedAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalPayments { get; set; }
        public int PendingPayments { get; set; }
    }

    // 🔹 Şifre Güncelleme DTO'su
    public class UpdatePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    // 🔹 İletişim Bilgileri Güncelleme DTO'su
    public class UpdateContactDto
    {
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    // 🔹 Bina Atama/Çıkarma Sonuç DTO'su
    public class BuildingAssignmentResultDto
    {
        public int AdminId { get; set; }
        public int BuildingId { get; set; }
        public bool IsAssigned { get; set; }
        public DateTime AssignmentDate { get; set; }
    }
}