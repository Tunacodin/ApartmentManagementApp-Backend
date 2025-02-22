using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.DTOs.Reports;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class AdminReportManager : IAdminReportService
    {
        private readonly IPaymentDal _paymentDal;
        private readonly IComplaintDal _complaintDal;
        private readonly IMeetingDal _meetingDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly ILogger<AdminReportManager> _logger;

        public AdminReportManager(
            IPaymentDal paymentDal,
            IComplaintDal complaintDal,
            IMeetingDal meetingDal,
            IApartmentDal apartmentDal,
            ILogger<AdminReportManager> logger)
        {
            _paymentDal = paymentDal;
            _complaintDal = complaintDal;
            _meetingDal = meetingDal;
            _apartmentDal = apartmentDal;
            _logger = logger;
        }

        public async Task<ApiResponse<List<MonthlyIncomeDto>>> GetMonthlyIncomeAsync(int adminId)
        {
            try
            {
                var monthlyIncome = await _paymentDal.GetMonthlyIncomeAsync(adminId);
                return ApiResponse<List<MonthlyIncomeDto>>.SuccessResult("Aylık gelir raporu getirildi", monthlyIncome);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly income report");
                return ApiResponse<List<MonthlyIncomeDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(int adminId)
        {
            try
            {
                var stats = await _paymentDal.GetPaymentStatisticsAsync(adminId);
                return ApiResponse<PaymentStatisticsDto>.SuccessResult("Ödeme istatistikleri getirildi", stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment statistics");
                return ApiResponse<PaymentStatisticsDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<ComplaintAnalyticsDto>> GetComplaintAnalyticsAsync(int adminId)
        {
            try
            {
                var analytics = await _complaintDal.GetComplaintAnalyticsAsync(adminId);
                return ApiResponse<ComplaintAnalyticsDto>.SuccessResult("Şikayet analizi getirildi", analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint analytics");
                return ApiResponse<ComplaintAnalyticsDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<OccupancyRatesDto>> GetOccupancyRatesAsync(int adminId)
        {
            try
            {
                var rates = await _apartmentDal.GetOccupancyRatesAsync(adminId);
                return ApiResponse<OccupancyRatesDto>.SuccessResult("Doluluk oranları getirildi", rates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting occupancy rates");
                return ApiResponse<OccupancyRatesDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<MeetingStatisticsDto>> GetMeetingStatisticsAsync(int adminId)
        {
            try
            {
                var stats = await _meetingDal.GetMeetingStatisticsAsync(adminId);
                return ApiResponse<MeetingStatisticsDto>.SuccessResult("Toplantı istatistikleri getirildi", stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting meeting statistics");
                return ApiResponse<MeetingStatisticsDto>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
} 