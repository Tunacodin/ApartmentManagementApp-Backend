using Business.Abstract;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.DTOs.Reports;
using Microsoft.Extensions.Logging;
using Core.Constants;

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

        public async Task<ApiResponse<List<MonthlyIncomeReportDto>>> GetMonthlyIncomeAsync(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting buildings for admin {adminId}");
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);

                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<List<MonthlyIncomeReportDto>>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                _logger.LogInformation($"Found {buildings.Count} buildings for admin {adminId}");
                var result = await _paymentDal.GetMonthlyIncomeAsync(adminId);

                if (result == null)
                {
                    _logger.LogWarning($"No payment data found for admin {adminId}");
                    return ApiResponse<List<MonthlyIncomeReportDto>>.ErrorResult("Ödeme verisi bulunamadı");
                }

                _logger.LogInformation($"Found {result.Count} monthly income records for admin {adminId}");
                return ApiResponse<List<MonthlyIncomeReportDto>>.SuccessResult("Aylık gelir raporu başarıyla getirildi", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetMonthlyIncomeAsync for admin {AdminId}. Error: {Message}", adminId, ex.Message);
                return ApiResponse<List<MonthlyIncomeReportDto>>.ErrorResult($"Hata detayı: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(int adminId)
        {
            try
            {
                if (adminId <= 0)
                {
                    _logger.LogWarning($"Invalid admin ID: {adminId}");
                    return ApiResponse<PaymentStatisticsDto>.ErrorResult(Messages.InvalidAdminId);
                }

                _logger.LogInformation($"Getting payment statistics for admin {adminId}");

                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<PaymentStatisticsDto>.ErrorResult(Messages.BuildingsNotFound);
                }

                var result = await _paymentDal.GetPaymentStatisticsAsync(adminId);

                _logger.LogInformation($"Successfully retrieved payment statistics for admin {adminId}");
                return ApiResponse<PaymentStatisticsDto>.SuccessResult(Messages.PaymentStatisticsRetrieved, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPaymentStatisticsAsync for admin {AdminId}", adminId);
                return ApiResponse<PaymentStatisticsDto>.ErrorResult(Messages.UnexpectedError);
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
                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);
                if (!buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin {adminId}");
                    return ApiResponse<OccupancyRatesDto>.ErrorResult($"Admin ID {adminId} için bina bulunamadı");
                }

                var result = await _buildingDal.GetOccupancyRatesAsync(adminId);
                if (result == null)
                {
                    _logger.LogWarning($"No occupancy data found for admin {adminId}");
                    return ApiResponse<OccupancyRatesDto>.ErrorResult("Doluluk oranı verisi bulunamadı");
                }

                _logger.LogInformation($"Successfully retrieved occupancy rates for admin {adminId}");
                return ApiResponse<OccupancyRatesDto>.SuccessResult(Messages.OccupancyRatesRetrieved, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting occupancy rates for admin {AdminId}", adminId);
                return ApiResponse<OccupancyRatesDto>.ErrorResult(Messages.UnexpectedError);
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

        public async Task<ApiResponse<PaymentDetailedStatisticsDto>> GetDetailedPaymentStatisticsAsync(int adminId)
        {
            try
            {
                _logger.LogInformation("Admin {adminId} için detaylı ödeme istatistikleri başlatılıyor", adminId);
                var detailedStats = new PaymentDetailedStatisticsDto();

                var buildings = await _buildingDal.GetAllAsync(b => b.AdminId == adminId);

                if (!buildings.Any())
                {
                    _logger.LogWarning("Admin {adminId} için bina bulunamadı", adminId);
                    return ApiResponse<PaymentDetailedStatisticsDto>.ErrorResult(Messages.BuildingsNotFound);
                }

                try
                {
                    _logger.LogInformation("Bina istatistikleri alınıyor...");
                    foreach (var building in buildings)
                    {
                        var buildingStats = await _paymentDal.GetBuildingPaymentStatisticsAsync(building.Id);
                        detailedStats.BuildingStatistics.Add(buildingStats);
                    }

                    _logger.LogInformation("En çok borcu olanlar listesi alınıyor...");
                    detailedStats.TopDebtors = await _paymentDal.GetTopDebtorsAsync(adminId, 10);

                    _logger.LogInformation("En çok ödeme yapanlar listesi alınıyor...");
                    detailedStats.TopPayers = await _paymentDal.GetTopPayersAsync(adminId, 10);

                    _logger.LogInformation("Aylık tahsilat oranları alınıyor...");
                    detailedStats.MonthlyCollectionRates = await _paymentDal.GetMonthlyCollectionRatesAsync(adminId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Detaylı istatistikler toplanırken hata oluştu: {Message}", ex.Message);
                    throw;
                }

                _logger.LogInformation("Admin {adminId} için detaylı ödeme istatistikleri başarıyla tamamlandı", adminId);
                return ApiResponse<PaymentDetailedStatisticsDto>.SuccessResult(
                    Messages.DetailedPaymentStatisticsRetrieved,
                    detailedStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Detaylı hata: {Message}, Stack: {Stack}",
                    ex.Message,
                    ex.StackTrace);
                return ApiResponse<PaymentDetailedStatisticsDto>.ErrorResult(
                    $"Detaylı hata: {ex.Message}");
            }
        }

        // Diğer metodların implementasyonları...
    }
}