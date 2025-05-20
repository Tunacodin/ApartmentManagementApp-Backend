using Business.Abstract;
using Core.Utilities.Results;
using Entities.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceService _financeService;

        public FinanceController(IFinanceService financeService)
        {
            _financeService = financeService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] FinanceFilterDto filter)
        {
            try
            {
                var dashboardResult = await _financeService.GetFinanceDashboardAsync(filter);
                if (!dashboardResult.Success)
                    return BadRequest(dashboardResult);

                var overduePayments = await _financeService.GetOverduePaymentsAsync(filter);
                var statistics = await _financeService.GetPaymentStatisticsAsync(filter);

                var comprehensiveDashboard = new
                {
                    Dashboard = dashboardResult.Data,
                    OverduePayments = overduePayments.Data,
                    Statistics = statistics.Data,
                    LastUpdated = DateTime.Now
                };

                return Ok(ApiResponse<object>.SuccessResult("Tüm finansal veriler başarıyla getirildi.", comprehensiveDashboard));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult($"Veriler getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("overdue-payments")]
        public async Task<IActionResult> GetOverduePayments([FromQuery] FinanceFilterDto filter)
        {
            var result = await _financeService.GetOverduePaymentsAsync(filter);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("payment-history")]
        public async Task<IActionResult> GetPaymentHistory([FromQuery] FinanceFilterDto filter)
        {
            var result = await _financeService.GetPaymentHistoryAsync(filter);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] FinanceFilterDto filter)
        {
            var result = await _financeService.GetPaymentStatisticsAsync(filter);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}