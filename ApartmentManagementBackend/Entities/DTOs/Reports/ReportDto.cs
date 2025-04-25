using System;
using System.Collections.Generic;

namespace Entities.DTOs.Reports
{
    public class AdminReportDto
    {
        public BuildingReportSummaryDto BuildingSummary { get; set; } = new();
        public List<SurveyReportDto> RecentSurveys { get; set; } = new();
        public List<ComplaintReportDto> RecentComplaints { get; set; } = new();
        public List<TenantReportDto> RecentTenants { get; set; } = new();
        public List<TenantReportDto> ExpiringContracts { get; set; } = new();
        public List<NotificationReportDto> RecentNotifications { get; set; } = new();
        public List<MeetingReportDto> RecentMeetings { get; set; } = new();
        public FinancialReportDto FinancialSummary { get; set; } = new();
        public DateTime ReportGeneratedAt { get; set; } = DateTime.Now;
    }

    public class BuildingReportSummaryDto
    {
        public int TotalBuildings { get; set; }
        public int TotalApartments { get; set; }
        public int OccupiedApartments { get; set; }
        public int EmptyApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public int TotalTenants { get; set; }
        public int ActiveComplaints { get; set; }
        public int PendingPayments { get; set; }
        public decimal TotalMonthlyIncome { get; set; }
        public BuildingIncomeDto HighestIncomeBuilding { get; set; } = new();
        public BuildingIncomeDto HighestRentBuilding { get; set; } = new();
    }

    public class BuildingIncomeDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
        public decimal AverageRent { get; set; }
        public int TotalApartments { get; set; }
        public decimal OccupancyRate { get; set; }
    }

    public class SurveyReportDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalParticipants { get; set; }
        public int ResponseCount { get; set; }
        public decimal ParticipationRate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public int DaysSinceCreated => (int)(DateTime.Now - CreatedAt).TotalDays;
    }

    public class ComplaintReportDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
        public int DaysOpen { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    public class TenantReportDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
        public string ApartmentNumber { get; set; } = string.Empty;
        public DateTime MoveInDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public int DaysUntilContractEnds => ContractEndDate.HasValue ?
            (int)(ContractEndDate.Value - DateTime.Now).TotalDays : 0;
        public decimal MonthlyRent { get; set; }
        public DateTime? LastPaymentDate { get; set; }
    }

    public class NotificationReportDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int RecipientCount { get; set; }
        public int ReadCount { get; set; }
        public decimal ReadRate { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class MeetingReportDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int ExpectedParticipants { get; set; }
        public int ActualParticipants { get; set; }
        public decimal ParticipationRate { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class FinancialReportDto
    {
        public decimal TotalExpectedIncome { get; set; }
        public decimal TotalCollectedIncome { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalPayments { get; set; }
        public int OverduePayments { get; set; }
        public List<MonthlyIncomeReportDto> MonthlyIncome { get; set; } = new();
        public List<BuildingFinancialDto> BuildingFinancials { get; set; } = new();
    }

    public class BuildingFinancialDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public decimal MonthlyExpectedIncome { get; set; }
        public decimal MonthlyCollectedIncome { get; set; }
        public decimal CollectionRate { get; set; }
        public int OverduePayments { get; set; }
    }
}