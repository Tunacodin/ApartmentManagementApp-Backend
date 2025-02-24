namespace Entities.DTOs.Reports
{
    public class MonthlyIncomeDto
    {
        public string Month { get; set; }
        public decimal Amount { get; set; }
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
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
        public double AverageResolutionTime { get; set; }
    }

    public class OccupancyRatesDto
    {
        public int TotalUnits { get; set; }
        public int OccupiedUnits { get; set; }
        public int VacantUnits { get; set; }
        public double Percentage { get; set; }
    }

    public class MeetingStatisticsDto
    {
        public int TotalMeetings { get; set; }
        public int UpcomingMeetings { get; set; }
        public int CompletedMeetings { get; set; }
        public double AttendanceRate { get; set; }
    }
} 