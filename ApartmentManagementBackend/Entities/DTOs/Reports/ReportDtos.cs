namespace Entities.DTOs.Reports
{
    public class MonthlyIncomeDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal UnpaidAmount { get; set; }
    }

    public class PaymentStatisticsDto
    {
        // General Payment Statistics
        public int TotalPaymentCount { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalPending { get; set; }
        public int Paid { get; set; }
        public int Pending { get; set; }
        public int Overdue { get; set; }

        // Delay and Penalty Analysis
        public int TotalDelayedPayments { get; set; }
        public int TotalDelayedDays { get; set; }
        public decimal AverageDelayDays { get; set; }
        public decimal TotalPenaltyAmount { get; set; }

        // Payment Rate Analysis
        public decimal OnTimePaymentRate { get; set; }
        public decimal DelayedPaymentRate { get; set; }
        public decimal UnpaidPaymentRate { get; set; }

        // Payment Type Analysis
        public decimal TotalRentAmount { get; set; }
        public decimal TotalDuesAmount { get; set; }
        public decimal UnpaidRentAmount { get; set; }
        public decimal UnpaidDuesAmount { get; set; }

        // Top Defaulters
        public List<PaymentDefaulterDto> TopDefaulters { get; set; }

        public PaymentStatisticsDto()
        {
            TopDefaulters = new List<PaymentDefaulterDto>();
        }
    }

    public class PaymentDefaulterDto
    {
        public int UserId { get; set; }
        public required string UserFullName { get; set; }
        public decimal TotalDebt { get; set; }
        public int DelayedDays { get; set; }
    }

    public class ComplaintAnalyticsDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
        public double AverageResolutionTime { get; set; }
    }

    public class MeetingStatisticsDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int UpcomingMeetings { get; set; }
        public double AttendanceRate { get; set; }
    }

    public class OccupancyRatesDto
    {
        public int TotalApartments { get; set; }
        public int OccupiedApartments { get; set; }
        public decimal OccupancyRate { get; set; }
        public List<BuildingOccupancyDto> BuildingOccupancies { get; set; } = new();
    }

    public class BuildingOccupancyDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public int TotalApartments { get; set; }
        public int OccupiedApartments { get; set; }
        public decimal OccupancyRate { get; set; }
    }

    public class PaymentDetailedStatisticsDto
    {
        public PaymentStatisticsDto TotalStatistics { get; set; }
        public List<BuildingPaymentStatisticsDto> BuildingStatistics { get; set; }
        public List<TopDebtorDto> TopDebtors { get; set; }
        public List<TopPayerDto> TopPayers { get; set; }
        public List<MonthlyCollectionRateDto> MonthlyCollectionRates { get; set; }

        public PaymentDetailedStatisticsDto()
        {
            TotalStatistics = new PaymentStatisticsDto();
            BuildingStatistics = new List<BuildingPaymentStatisticsDto>();
            TopDebtors = new List<TopDebtorDto>();
            TopPayers = new List<TopPayerDto>();
            MonthlyCollectionRates = new List<MonthlyCollectionRateDto>();
        }
    }

    public class BuildingPaymentStatisticsDto
    {
        public int BuildingId { get; set; }
        public required string BuildingName { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalPending { get; set; }
        public int PaidCount { get; set; }
        public int PendingCount { get; set; }
        public int OverdueCount { get; set; }
        public decimal CollectionRate { get; set; }
    }

    public class TopDebtorDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string ApartmentInfo { get; set; }
        public decimal TotalDebt { get; set; }
        public int OverdueDays { get; set; }
        public int OverduePaymentCount { get; set; }
    }

    public class TopPayerDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string ApartmentInfo { get; set; }
        public decimal TotalPaid { get; set; }
        public int OnTimePaymentCount { get; set; }
        public decimal OnTimePaymentRate { get; set; }
    }

    public class MonthlyCollectionRateDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal CollectedAmount { get; set; }
        public decimal CollectionRate { get; set; }
        public int TotalPaymentCount { get; set; }
        public int PaidPaymentCount { get; set; }
    }
} 