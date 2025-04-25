using System;

namespace Entities.DTOs
{
    // 🔹 Temel Kiracı DTO'su (Ekleme/Güncelleme İçin)
    public class TenantDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "tenant"; // Varsayılan "tenant"
        public bool IsActive { get; set; } = true; // Varsayılan aktif
        public string? ProfileImageUrl { get; set; } // Profil resmi URL'i
        public int ApartmentId { get; set; } // Artık nullable değil
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }

        public class ActivityDto
        {
            public int Id { get; set; }
            public string Type { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public DateTime Date { get; set; }
            public DateTime? EndDate { get; set; }
            public string Status { get; set; }
            public decimal? Amount { get; set; }
        }
    }

    // 🔹 Kiracı Listeleme DTO'su (Listeleme İçin)
    public class TenantListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; } // Profil resmi URL'i
        public int ApartmentId { get; set; } // Artık nullable değil
        public string BuildingName { get; set; } = string.Empty; // Apartman adı
        public int UnitNumber { get; set; } // Daire numarası
    }

    // 🔹 Kiracı Detay DTO'su (Detay Görüntüleme İçin)
    public class TenantDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int ApartmentId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
        public DateTime? LastPaymentDate { get; set; }

        // Yeni eklenen özellikler
        public int ApartmentNumber { get; set; }
        public int BuildingId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string AdminPhone { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
    }

    // 🔹 Kiracı + Ödemeler DTO'su (İsteğe Bağlı Olarak Ödemeler Dahil)
    public class TenantWithPaymentsDto : TenantDetailDto
    {
        public List<PaymentHistoryDto> Payments { get; set; } = new();
    }

    // 🔹 Kiracı Aktiviteler DTO'su
    public class TenantActivitiesDto
    {
        public List<PaymentWithUserDto> PaymentHistory { get; set; } = new();
        public List<MeetingDto> MeetingHistory { get; set; } = new();
        public List<SurveyDto> SurveyHistory { get; set; } = new();
        public List<ComplaintDto> ComplaintHistory { get; set; } = new();
    }

    // 🔹 Toplantı Aktivite DTO'su
    public class MeetingActivityDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime MeetingDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Upcoming, Completed
        public string OrganizerName { get; set; } = string.Empty;
    }

    // 🔹 Anket Aktivite DTO'su
    public class SurveyActivityDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool HasResponded { get; set; }
        public string Status { get; set; } = string.Empty; // Active, Completed
        public Dictionary<string, string>? SurveyResults { get; set; }
    }

    // 🔹 Kiracı Profil DTO'su
    public class TenantProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        // Daire ve Bina Bilgileri
        public int ApartmentId { get; set; }
        public string ApartmentNumber { get; set; }
        public int BuildingId { get; set; }
        public string BuildingName { get; set; }
        public string BuildingAddress { get; set; }

        // Kontrat Bilgileri
        public DateTime LeaseStartDate { get; set; }
        public DateTime LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }

        // İstatistikler
        public int TotalPayments { get; set; }
        public int PendingPayments { get; set; }
        public int TotalComplaints { get; set; }
        public int ActiveComplaints { get; set; }
        public int TotalMeetings { get; set; }
        public int UpcomingMeetings { get; set; }

        // Son Aktiviteler
        public List<PaymentWithUserDto> RecentPayments { get; set; }
        public List<ComplaintWithUserDto> RecentComplaints { get; set; }
        public List<MeetingDto> UpcomingMeetingsList { get; set; }

        // Yönetici Bilgileri
        public string AdminName { get; set; }
        public string AdminPhone { get; set; }
        public string AdminEmail { get; set; }

        // Ev Sahibi Bilgileri
        public string OwnerName { get; set; }
        public string OwnerPhone { get; set; }
        public string OwnerEmail { get; set; }
    }
}