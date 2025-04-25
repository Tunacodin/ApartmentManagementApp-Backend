using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // Ana Finans Dashboard DTO'su
    public class FinanceManagementDashboardDto
    {
        public FinancialSummaryDto Summary { get; set; } = new();
        public List<MonthlyPaymentDto> MonthlyPayments { get; set; } = new();
        public List<BuildingFinanceDto> BuildingFinances { get; set; } = new();
        public List<OverduePaymentDto> OverduePayments { get; set; } = new();
        public PaymentStatisticsDto Statistics { get; set; } = new();
        public PaginationMetadata Pagination { get; set; } = new();
    }

    // Aylık Ödeme Özeti DTO'su
    public class MonthlyPaymentDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal TotalExpectedAmount { get; set; }
        public decimal TotalCollectedAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalPaymentCount { get; set; }
        public int CompletedPaymentCount { get; set; }
        public int PendingPaymentCount { get; set; }
        public List<PaymentDetailDto> Payments { get; set; } = new();
    }

    // Bina Bazlı Finans DTO'su
    public class BuildingFinanceDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public decimal MonthlyExpectedIncome { get; set; }
        public decimal MonthlyCollectedAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalApartments { get; set; }
        public int PaidApartments { get; set; }
        public int UnpaidApartments { get; set; }
        public decimal TotalDuesAmount { get; set; }
        public List<ApartmentFinanceDto> ApartmentFinances { get; set; } = new();
    }

    // Daire Bazlı Finans DTO'su
    public class ApartmentFinanceDto
    {
        public int ApartmentId { get; set; }
        public string ApartmentNumber { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
        public decimal MonthlyDuesAmount { get; set; }
        public bool IsPaid { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public int DelayedDays { get; set; }
        public decimal DelayPenaltyAmount { get; set; }
        public decimal TotalDueAmount { get; set; }
        public List<FinancePaymentHistoryDto> PaymentHistory { get; set; } = new();
    }

    // Gecikmiş Ödeme DTO'su
    public class OverduePaymentDto
    {
        public int PaymentId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string ApartmentNumber { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public decimal OriginalAmount { get; set; }
        public DateTime DueDate { get; set; }
        public int DelayedDays { get; set; }
        public decimal DailyPenaltyRate { get; set; }
        public decimal PenaltyAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    // Ödeme Geçmişi DTO'su
    public class FinancePaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool WasDelayed { get; set; }
        public int? DelayedDays { get; set; }
        public decimal? PenaltyAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
    }

    // Ödeme İstatistikleri DTO'su
    public class PaymentStatisticsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalPendingAmount { get; set; }
        public decimal TotalPenaltyAmount { get; set; }
        public int TotalPayments { get; set; }
        public int CompletedPayments { get; set; }
        public int PendingPayments { get; set; }
        public int DelayedPayments { get; set; }
        public decimal AveragePaymentAmount { get; set; }
        public decimal AverageDelayDays { get; set; }
        public Dictionary<string, decimal> PaymentTypeDistribution { get; set; } = new();
        public Dictionary<string, int> PaymentMethodDistribution { get; set; } = new();
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
    }

    // Aylık Trend DTO'su
    public class MonthlyTrendDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal TotalAmount { get; set; }
        public int PaymentCount { get; set; }
        public decimal CollectionRate { get; set; }
        public int DelayedPaymentCount { get; set; }
    }

    // Filtreleme DTO'su
    public class FinanceFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? BuildingId { get; set; }
        public int? ApartmentId { get; set; }
        public string? PaymentType { get; set; }
        public string? PaymentStatus { get; set; }
        public bool? IsOverdueOnly { get; set; }
        public string SortBy { get; set; } = "date";
        public string SortDirection { get; set; } = "desc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}