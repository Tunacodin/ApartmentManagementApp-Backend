using Core.Utilities.Results;
using Entities.DTOs.Reports;

namespace Business.Abstract
{
    public interface IAdminReportsService
    {
        Task<ApiResponse<List<MonthlyIncomeReportDto>>> GetMonthlyIncomeAsync(int adminId);
        Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(int adminId);
        Task<ApiResponse<ComplaintAnalyticsDto>> GetComplaintAnalyticsAsync(int adminId);
        Task<ApiResponse<OccupancyRatesDto>> GetOccupancyRatesAsync(int adminId);
        Task<ApiResponse<MeetingStatisticsDto>> GetMeetingStatisticsAsync(int adminId);
        Task<ApiResponse<PaymentDetailedStatisticsDto>> GetDetailedPaymentStatisticsAsync(int adminId);
    }
}