using Business.Abstract;
using Core.Utilities.Results;
using Entities.DTOs.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        [HttpGet("admin/{adminId}")]
        public async Task<IActionResult> GetAdminReport(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetAdminReportAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin report for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting admin report."));
            }
        }

        [HttpGet("buildings/{adminId}")]
        public async Task<IActionResult> GetBuildingSummary(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetBuildingSummaryAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting building summary."));
            }
        }

        [HttpGet("surveys/{adminId}")]
        public async Task<IActionResult> GetRecentSurveys(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetRecentSurveysAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent surveys for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting recent surveys."));
            }
        }

        [HttpGet("complaints/{adminId}")]
        public async Task<IActionResult> GetRecentComplaints(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetRecentComplaintsAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent complaints for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting recent complaints."));
            }
        }

        [HttpGet("tenants/{adminId}")]
        public async Task<IActionResult> GetRecentTenants(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetRecentTenantsAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent tenants for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting recent tenants."));
            }
        }

        [HttpGet("contracts/expiring/{adminId}")]
        public async Task<IActionResult> GetExpiringContracts(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetExpiringContractsAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expiring contracts for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting expiring contracts."));
            }
        }

        [HttpGet("notifications/{adminId}")]
        public async Task<IActionResult> GetRecentNotifications(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetRecentNotificationsAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting recent notifications."));
            }
        }

        [HttpGet("meetings/{adminId}")]
        public async Task<IActionResult> GetRecentMeetings(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetRecentMeetingsAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent meetings for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting recent meetings."));
            }
        }

        [HttpGet("financial/{adminId}")]
        public async Task<IActionResult> GetFinancialSummary(int adminId, [FromQuery] int? buildingId = null)
        {
            try
            {
                var result = await _reportService.GetFinancialSummaryAsync(adminId, buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("An error occurred while getting financial summary."));
            }
        }
    }
}