using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    // 🔹 Kiracı Dashboard DTO'su
    public class TenantDashboardDto
    {
        public TenantDashboardDto()
        {
            Profile = new TenantProfileDto();
            Contract = new ContractInfoDto();
            Apartment = new ApartmentInfoDto();
            Building = new BuildingInfoDto();
            PaymentSummary = new PaymentSummaryDto();
            RecentPayments = new List<PaymentHistoryDto>();
            RecentPenalties = new List<PenaltyHistoryDto>();
            UpcomingMeetings = new List<MeetingDto>();
            ActiveSurveys = new List<SurveyDto>();
            RecentComplaints = new List<ComplaintDto>();
            Notifications = new List<NotificationDto>();
        }

        // Profil Bilgileri
        public TenantProfileDto Profile { get; set; }

        // Kontrat Bilgileri
        public ContractInfoDto Contract { get; set; }

        // Daire ve Bina Bilgileri
        public ApartmentInfoDto Apartment { get; set; }
        public BuildingInfoDto Building { get; set; }

        // Yönetici ve Ev Sahibi Bilgileri
        public AdminInfoDto? Admin { get; set; }
        public OwnerInfoDto? Owner { get; set; }

        // Ödeme Bilgileri
        public PaymentSummaryDto PaymentSummary { get; set; }
        public List<PaymentHistoryDto> RecentPayments { get; set; }
        public List<PenaltyHistoryDto> RecentPenalties { get; set; }

        // Aktiviteler
        public List<MeetingDto> UpcomingMeetings { get; set; }
        public List<SurveyDto> ActiveSurveys { get; set; }
        public List<ComplaintDto> RecentComplaints { get; set; }

        // Bildirimler
        public List<NotificationDto> Notifications { get; set; }
    }

    public class ContractInfoDto
    {
        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime EndDate { get; set; } = DateTime.Now;
        public int RemainingDays { get; set; }
        public int RemainingMonths { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
        public string ContractStatus { get; set; } = "Active";
        public int DaysUntilNextRent { get; set; }
    }

    public class ApartmentInfoDto
    {
        public int Id { get; set; }
        public int UnitNumber { get; set; }
        public int Floor { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public bool HasBalcony { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsOccupied { get; set; }
    }

    public class BuildingInfoDto
    {
        public int Id { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public bool HasElevator { get; set; }
        public bool HasPlayground { get; set; }
        public bool HasGarden { get; set; }
        public string ParkingType { get; set; } = string.Empty;
        public string HeatingType { get; set; } = string.Empty;
        public string PoolType { get; set; } = string.Empty;
        public int BuildingAge { get; set; }
        public List<string> IncludedServices { get; set; } = new();
    }

    public class AdminInfoDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public class OwnerInfoDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string IBAN { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
    }

    public class PaymentSummaryDto
    {
        public decimal CurrentBalance { get; set; }
        public decimal CurrentPenalty { get; set; }
        public decimal NextPaymentAmount { get; set; }
        public DateTime NextPaymentDate { get; set; } = DateTime.Now;
        public bool HasOverduePayments { get; set; }
        public decimal TotalPaidAmount { get; set; }
        public decimal TotalPendingAmount { get; set; }
    }

    public class PenaltyHistoryDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public bool IsPaid { get; set; }
    }
}