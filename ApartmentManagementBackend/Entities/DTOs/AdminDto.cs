using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

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
        private decimal _occupancyRate;
        public decimal OccupancyRate
        {
            get => _occupancyRate;
            set => _occupancyRate = value >= 0 && value <= 100 ? value : 0;
        }
        public decimal TotalDuesAmount { get; set; }
        public decimal TotalRentAmount { get; set; }
        public int ActiveComplaints { get; set; }
        public DateTime LastMaintenanceDate { get; set; }
        public decimal PendingAmount { get; set; }
        private decimal _collectionRate;
        public decimal CollectionRate
        {
            get => _collectionRate;
            set => _collectionRate = value >= 0 && value <= 100 ? value : 0;
        }
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
        public List<PaymentWithUserDto> RecentPayments { get; set; } = new();
        public List<ComplaintWithUserDto> RecentComplaints { get; set; } = new();

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
        public decimal MonthlyDuesAmount { get; set; }
        public decimal MonthlyRentAmount { get; set; }
        public decimal CollectedDuesAmount { get; set; }
        public decimal CollectedRentAmount { get; set; }
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

    // 🔹 Dashboard Filtreleme DTO'su
    public class ManagementFilterDto
    {
        public int? BuildingId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? PaymentStatus { get; set; }
        public string? ComplaintStatus { get; set; }
        public string? ApartmentStatus { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "date";
        public string SortDirection { get; set; } = "desc";
    }

    // 🔹 Yönetim Ekranı DTO'ları
    public class ManagementDashboardDto
    {
        public List<BuildingManagementDto> Buildings { get; set; } = new();

        // Seçili bina varsa aşağıdaki veriler doldurulur
        public List<ApartmentBasicDto> Apartments { get; set; } = new();
        public List<TenantBasicDto> Tenants { get; set; } = new();
        public List<MeetingBasicDto> UpcomingMeetings { get; set; } = new();
        public List<ComplaintBasicDto> PendingComplaints { get; set; } = new();
        public List<PaymentBasicDto> OverduePayments { get; set; } = new();
        public BuildingBasicStatsDto Statistics { get; set; } = new();
    }

    public class ApartmentBasicDto
    {
        public int Id { get; set; }
        public string UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Status { get; set; } // Boş/Dolu
        public string TenantName { get; set; } = string.Empty;
    }

    public class TenantBasicDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string ApartmentNumber { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string ProfileImage { get; set; } = string.Empty;
        public string ContractFile { get; set; } = string.Empty;
    }

    public class MeetingBasicDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime MeetingDate { get; set; }
        public string Location { get; set; }
    }

    public class ComplaintBasicDto
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ApartmentNumber { get; set; }
    }

    public class PaymentBasicDto
    {
        public int Id { get; set; }
        public string PaymentType { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string ApartmentNumber { get; set; }
    }

    public class BuildingBasicStatsDto
    {
        private decimal _occupancyRate;
        public decimal OccupancyRate
        {
            get => _occupancyRate;
            set => _occupancyRate = value >= 0 && value <= 100 ? value : 0;
        }
        public DateTime LastMaintenanceDate { get; set; }
    }

    // Bina Yönetimi DTO'su
    public class BuildingManagementDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int FloorCount { get; set; }
        public int TotalApartments { get; set; }
        private decimal _occupancyRate;
        public decimal OccupancyRate
        {
            get => _occupancyRate;
            set => _occupancyRate = value >= 0 && value <= 100 ? value : 0;
        }
        public DateTime LastMaintenanceDate { get; set; }
        public int EmptyApartmentsCount { get; set; }
        public int TotalResidentsCount { get; set; }
        public int ActiveComplaintsCount { get; set; }
        public int PendingPaymentsCount { get; set; }
    }

    // Daire Yönetimi DTO'su
    public class ApartmentManagementDto
    {
        public int Id { get; set; }
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Status { get; set; } = string.Empty; // Boş/Dolu
        public string TenantFullName { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DuesAmount { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public string OwnerFullName { get; set; } = string.Empty;
        public int BuildingId { get; set; }
    }

    // Kiracı Yönetimi DTO'su
    public class TenantManagementDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ApartmentNumber { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public DateTime? LastPaymentDate { get; set; }
        public int ActiveComplaintsCount { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateTime MoveInDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public string ContractFile { get; set; } = string.Empty;
    }

    // Toplantı Yönetimi DTO'su
    public class MeetingManagementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string OrganizedBy { get; set; } = string.Empty;
        public string Agenda { get; set; } = string.Empty;
        public int ParticipantsCount { get; set; }
        public bool IsCompleted { get; set; }
        public int BuildingId { get; set; }
    }

    // Şikayet Yönetimi DTO'su
    public class ComplaintManagementDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string ComplainerName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public string ApartmentNumber { get; set; } = string.Empty;
        public int DaysOpen { get; set; }
        public string Status { get; set; } = string.Empty; // Bekliyor/Çözüldü
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; } = string.Empty;
        public int BuildingId { get; set; }
    }

    // Ödeme Yönetimi DTO'su
    public class PaymentManagementDto
    {
        public int Id { get; set; }
        public string TenantFullName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentType { get; set; } = string.Empty; // Aidat/Kira
        public DateTime? PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty; // Ödendi/Ödenmedi
        public string ApartmentNumber { get; set; } = string.Empty;
        public int BuildingId { get; set; }
    }

    // Bildirim Yönetimi DTO'su
    public class NotificationManagementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Recipients { get; set; } = string.Empty; // Tüm Kullanıcılar/Seçili Daireler/Seçili Bina
        public DateTime CreatedAt { get; set; }
        public int SentCount { get; set; }
        public int ReadCount { get; set; }
        public int CreatedByAdminId { get; set; }
    }

    // İstatistikler ve KPI'lar DTO'su
    public class BuildingStatisticsDto
    {
        public int TotalApartments { get; set; }
        public int EmptyApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public decimal Last30DaysIncome { get; set; }
        public int DelayedPaymentsCount { get; set; }
        public int OpenComplaintsCount { get; set; }
        public int DaysSinceLastMeeting { get; set; }
        public int DaysSinceLastMaintenance { get; set; }
        public Dictionary<string, decimal> MonthlyIncomeChart { get; set; } = new();
        public Dictionary<string, decimal> OccupancyRateChart { get; set; } = new();
    }
}