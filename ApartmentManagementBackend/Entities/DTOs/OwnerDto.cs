using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // 🔹 Temel Malik DTO'su (Ekleme/Güncelleme İçin)
    public class OwnerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "owner";
        public bool IsActive { get; set; } = true;
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        // Banka Bilgileri
        public string IBAN { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
    }

    // 🔹 Malik Liste DTO'su (Genel Liste Görünümü İçin)
    public class OwnerListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int TotalProperties { get; set; }
        public int OccupiedProperties { get; set; }
        public decimal TotalMonthlyIncome { get; set; }
    }

    // 🔹 Malik Detay DTO'su (Tam Detay Görünümü İçin)
    public class OwnerDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        // Banka Bilgileri
        public string IBAN { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;

        // Mülk Bilgileri
        public List<OwnerPropertyDto> Properties { get; set; } = new();
        public decimal TotalMonthlyIncome { get; set; }
        public decimal TotalExpectedIncome { get; set; }
        public int TotalComplaints { get; set; }
        public List<OwnerTenantDto> Tenants { get; set; } = new();
    }

    // 🔹 Malik Mülk DTO'su
    public class OwnerPropertyDto
    {
        public int ApartmentId { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DuesAmount { get; set; }
        public bool IsOccupied { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public OwnerTenantDto? CurrentTenant { get; set; }
    }

    // 🔹 Malik-Kiracı DTO'su
    public class OwnerTenantDto
    {
        public int TenantId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int ApartmentId { get; set; }
        public string ApartmentInfo { get; set; } = string.Empty;
        public DateTime LeaseStartDate { get; set; }
        public DateTime LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public bool HasOverduePayments { get; set; }
        public List<OwnerTenantPaymentDto> RecentPayments { get; set; } = new();
    }

    // 🔹 Malik-Kiracı Ödeme DTO'su
    public class OwnerTenantPaymentDto
    {
        public int PaymentId { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    // 🔹 Malik Dashboard DTO'su
    public class OwnerDashboardDto
    {
        public int TotalProperties { get; set; }
        public int OccupiedProperties { get; set; }
        public decimal OccupancyRate { get; set; }
        public decimal TotalMonthlyIncome { get; set; }
        public decimal TotalExpectedIncome { get; set; }
        public int PendingPayments { get; set; }
        public int ActiveComplaints { get; set; }
        public List<OwnerPropertySummaryDto> PropertySummaries { get; set; } = new();
        public List<OwnerRecentActivityDto> RecentActivities { get; set; } = new();
    }

    // 🔹 Malik Mülk Özeti DTO'su
    public class OwnerPropertySummaryDto
    {
        public int ApartmentId { get; set; }
        public string BuildingAndUnit { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal MonthlyIncome { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public DateTime? ContractEndDate { get; set; }
    }

    // 🔹 Malik Aktivite DTO'su
    public class OwnerRecentActivityDto
    {
        public DateTime ActivityDate { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RelatedProperty { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}