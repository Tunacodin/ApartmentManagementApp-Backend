using Business.Abstract;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.DTOs.Reports;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class AdminReportsManager : IAdminReportsService
    {
        private readonly IPaymentDal _paymentDal;
        private readonly IComplaintDal _complaintDal;
        private readonly IMeetingDal _meetingDal;
        private readonly IBuildingDal _buildingDal;
        private readonly ILogger<AdminReportsManager> _logger;

        public AdminReportsManager(
            IPaymentDal paymentDal,
            IComplaintDal complaintDal,
            IMeetingDal meetingDal,
            IBuildingDal buildingDal,
            ILogger<AdminReportsManager> logger)
        {
            _paymentDal = paymentDal;
            _complaintDal = complaintDal;
            _meetingDal = meetingDal;
            _buildingDal = buildingDal;
            _logger = logger;
        }

        public async Task<ApiResponse<List<MonthlyIncomeDto>>> GetMonthlyIncomeAsync(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting buildings for admin {adminId}");
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<List<MonthlyIncomeDto>>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                _logger.LogInformation($"Found {buildings.Count} buildings for admin {adminId}");
                var result = await _paymentDal.GetMonthlyIncomeAsync(adminId);
                
                if (result == null)
                {
                    _logger.LogWarning($"No payment data found for admin {adminId}");
                    return ApiResponse<List<MonthlyIncomeDto>>.ErrorResult("Ödeme verisi bulunamadı");
                }

                _logger.LogInformation($"Found {result.Count} monthly income records for admin {adminId}");
                return ApiResponse<List<MonthlyIncomeDto>>.SuccessResult("Aylık gelir raporu başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMonthlyIncomeAsync for admin {AdminId}. Error: {Message}", adminId, ex.Message);
                return ApiResponse<List<MonthlyIncomeDto>>.ErrorResult($"Hata detayı: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting payment statistics for admin {adminId}");
                
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<PaymentStatisticsDto>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                var result = await _paymentDal.GetPaymentStatisticsAsync(adminId);
                if (result == null)
                {
                    _logger.LogWarning($"No payment statistics found for admin {adminId}");
                    return ApiResponse<PaymentStatisticsDto>.ErrorResult("Ödeme istatistikleri bulunamadı");
                }

                _logger.LogInformation($"Successfully retrieved payment statistics for admin {adminId}");
                return ApiResponse<PaymentStatisticsDto>.SuccessResult("Ödeme istatistikleri başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPaymentStatisticsAsync for admin {AdminId}. Error: {Message}", adminId, ex.Message);
                return ApiResponse<PaymentStatisticsDto>.ErrorResult($"Hata detayı: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ComplaintAnalyticsDto>> GetComplaintAnalyticsAsync(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting complaint analytics for admin {adminId}");
                
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<ComplaintAnalyticsDto>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                var result = await _complaintDal.GetComplaintAnalyticsAsync(adminId);
                if (result == null)
                {
                    _logger.LogWarning($"No complaint analytics found for admin {adminId}");
                    return ApiResponse<ComplaintAnalyticsDto>.ErrorResult("Şikayet analizi bulunamadı");
                }

                _logger.LogInformation($"Successfully retrieved complaint analytics for admin {adminId}");
                return ApiResponse<ComplaintAnalyticsDto>.SuccessResult("Şikayet analizi başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetComplaintAnalyticsAsync for admin {AdminId}. Error: {Message}", adminId, ex.Message);
                return ApiResponse<ComplaintAnalyticsDto>.ErrorResult($"Hata detayı: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OccupancyRatesDto>> GetOccupancyRatesAsync(int adminId)
        {
            try
            {
                var result = await _buildingDal.GetOccupancyRatesAsync(adminId);
                return ApiResponse<OccupancyRatesDto>.SuccessResult("Doluluk oranları başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting occupancy rates for admin {AdminId}", adminId);
                return ApiResponse<OccupancyRatesDto>.ErrorResult("Beklenmeyen bir hata oluştu");
            }
        }

        public async Task<ApiResponse<MeetingStatisticsDto>> GetMeetingStatisticsAsync(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting meeting statistics for admin {adminId}");
                
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<MeetingStatisticsDto>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                var result = await _meetingDal.GetMeetingStatisticsAsync(adminId);
                if (result == null)
                {
                    _logger.LogWarning($"No meeting statistics found for admin {adminId}");
                    return ApiResponse<MeetingStatisticsDto>.ErrorResult("Toplantı istatistikleri bulunamadı");
                }

                _logger.LogInformation($"Successfully retrieved meeting statistics for admin {adminId}");
                return ApiResponse<MeetingStatisticsDto>.SuccessResult("Toplantı istatistikleri başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMeetingStatisticsAsync for admin {AdminId}. Error: {Message}", adminId, ex.Message);
                return ApiResponse<MeetingStatisticsDto>.ErrorResult($"Hata detayı: {ex.Message}");
            }
        }

        // Diğer metodların implementasyonları...
    }
} 