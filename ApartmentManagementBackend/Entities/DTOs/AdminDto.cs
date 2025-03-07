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

    // 🔹 Gelişmiş Dashboard DTO'su
    public class EnhancedDashboardDto
    {
        // Genel İstatistikler
        public int TotalBuildings { get; set; }
        public int TotalTenants { get; set; }
        public int TotalApartments { get; set; }
        public int EmptyApartments { get; set; }

        // Son Aktiviteler
        public List<PaymentActivityDto> RecentPayments { get; set; } = new();
        public List<ComplaintActivityDto> RecentComplaints { get; set; } = new();

        // Finansal Özet
        public decimal MonthlyIncome { get; set; }

        // En Problemli Bina
        public MostComplainedBuildingDto MostComplainedBuilding { get; set; } = new();

        // Dashboard Özeti ve Detayları
        public DashboardSummaryDto Summary { get; set; } = new();
        public FinancialOverviewDto FinancialOverview { get; set; } = new();
        public List<DashboardActivityDto> RecentActivities { get; set; } = new();
        public PaginationMetadata Pagination { get; set; } = new();
    }

    // 🔹 Ödeme Aktivite DTO'su
    public class PaymentActivityDto
    {
        public int Id { get; set; }
        public string PaymentType { get; set; } = string.Empty; // Dues, Rent
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string ApartmentNumber { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string PayerName { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public string ProfileImageUrl { get; set; } = string.Empty;
    }

    // 🔹 Şikayet Aktivite DTO'su
    public class ComplaintActivityDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string ApartmentNumber { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string ComplainerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
    }

    // 🔹 En Çok Şikayet Alan Bina DTO'su
    public class MostComplainedBuildingDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int ComplaintCount { get; set; }
        public List<string> CommonComplaints { get; set; } = new();
        public DateTime LastComplaintDate { get; set; }
    }

    // 🔹 Dashboard Özet DTO'su
    public class DashboardSummaryDto
    {
        public int TotalBuildings { get; set; }
        public int TotalTenants { get; set; }
        public int TotalComplaints { get; set; }
        public int PendingPayments { get; set; }
        public int UpcomingMeetings { get; set; }
    }

    // 🔹 Finansal Genel Bakış DTO'su
    public class FinancialOverviewDto
    {
        public decimal MonthlyTotalIncome { get; set; }
        public decimal MonthlyExpectedIncome { get; set; }
        public decimal MonthlyCollectedAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public Dictionary<string, decimal> MonthlyBreakdown { get; set; } = new();
    }

    // 🔹 Dashboard Aktivite DTO'su
    public class DashboardActivityDto
    {
        public int Id { get; set; }
        public string ActivityType { get; set; } = string.Empty; // Complaint, Payment, Meeting, etc.
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
        public string RelatedEntity { get; set; } = string.Empty; // Apartment number, building name, etc.
        public string Status { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
    }

    // 🔹 Sayfalama Metadata DTO'su
    public class PaginationMetadata
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public bool HasPrevious => CurrentPage > 1;
        public bool HasNext => CurrentPage < TotalPages;
    }

    // 🔹 Dashboard Filtreleme DTO'su
    public class DashboardFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string TimeFrame { get; set; } = "weekly"; // daily, weekly, monthly, yearly
        public string? ActivityType { get; set; }
        public int? BuildingId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "date";
        public string SortDirection { get; set; } = "desc";
    }
}