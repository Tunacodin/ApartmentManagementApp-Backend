using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Microsoft.Extensions.Logging;
using Core.Utilities.Results;
using Core.Constants;
using Entities.DTOs.Reports;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminReportsController : ControllerBase
    {
        private readonly IAdminReportsService _adminReportsService;
        private readonly ILogger<AdminReportsController> _logger;

        public AdminReportsController(IAdminReportsService adminReportsService, ILogger<AdminReportsController> logger)
        {
            _adminReportsService = adminReportsService;
            _logger = logger;
        }

        [HttpGet("monthly-income/{adminId}")]
        public async Task<IActionResult> GetMonthlyIncome(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting monthly income report for admin {adminId}");
                
                if (adminId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResult("Geçersiz admin ID"));
                }

                var result = await _adminReportsService.GetMonthlyIncomeAsync(adminId);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get monthly income for admin {adminId}: {result.Message}");
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly income for admin {AdminId}", adminId);
                return StatusCode(500, ApiResponse<object>.ErrorResult($"Beklenmeyen bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("payment-statistics/{adminId}")]
        public async Task<IActionResult> GetPaymentStatistics(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting payment statistics for admin {adminId}");
                var result = await _adminReportsService.GetPaymentStatisticsAsync(adminId);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get payment statistics for admin {adminId}: {result.Message}");
                    return BadRequest(result);
                }

                return Ok(ApiResponse<PaymentStatisticsDto>.SuccessResult("Ödeme istatistikleri başarıyla getirildi", result.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment statistics for admin {AdminId}", adminId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("Beklenmeyen bir hata oluştu"));
            }
        }

        [HttpGet("{adminId}/reports/complaints")]
        public async Task<IActionResult> GetComplaintAnalytics(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting complaint analytics for admin {adminId}");
                var result = await _adminReportsService.GetComplaintAnalyticsAsync(adminId);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get complaint analytics for admin {adminId}: {result.Message}");
                    return BadRequest(result);
                }

                return Ok(ApiResponse<ComplaintAnalyticsDto>.SuccessResult("Şikayet analizi başarıyla getirildi", result.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting complaint analytics for admin {adminId}: {ex.Message}");
                return StatusCode(500, ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{adminId}/reports/occupancy")]
        public async Task<IActionResult> GetOccupancyRates(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting occupancy rates for admin {adminId}");
                var result = await _adminReportsService.GetOccupancyRatesAsync(adminId);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get occupancy rates for admin {adminId}: {result.Message}");
                    return BadRequest(result);
                }

                return Ok(ApiResponse<OccupancyRatesDto>.SuccessResult("Doluluk oranları başarıyla getirildi", result.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting occupancy rates for admin {adminId}: {ex.Message}");
                return StatusCode(500, ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{adminId}/reports/meetings")]
        public async Task<IActionResult> GetMeetingStatistics(int adminId)
        {
            try
            {
                _logger.LogInformation($"Getting meeting statistics for admin {adminId}");
                var result = await _adminReportsService.GetMeetingStatisticsAsync(adminId);
                
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get meeting statistics for admin {adminId}: {result.Message}");
                    return BadRequest(result);
                }

                return Ok(ApiResponse<MeetingStatisticsDto>.SuccessResult("Toplantı istatistikleri başarıyla getirildi", result.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting meeting statistics for admin {adminId}: {ex.Message}");
                return StatusCode(500, ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
} 