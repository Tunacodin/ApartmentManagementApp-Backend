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
        public int Paid { get; set; }
        public int Pending { get; set; }
        public int Overdue { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalPending { get; set; }
    }

    public class ComplaintAnalyticsDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
        public double AverageResolutionTime { get; set; }
    }

    public class OccupancyRatesDto
    {
        public int TotalApartments { get; set; }
        public int OccupiedApartments { get; set; }
        public decimal OccupancyRate { get; set; }
    }

    public class MeetingStatisticsDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int UpcomingMeetings { get; set; }
        public double AttendanceRate { get; set; }
    }
} 