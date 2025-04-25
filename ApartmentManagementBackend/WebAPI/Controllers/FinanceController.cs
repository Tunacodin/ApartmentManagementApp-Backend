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

                var monthlyPayments = await _financeService.GetMonthlyPaymentsAsync(
                    filter.BuildingId ?? 0,
                    DateTime.Now.Month,
                    DateTime.Now.Year);

                var overduePayments = await _financeService.GetOverduePaymentsAsync(filter);
                var statistics = await _financeService.GetPaymentStatisticsAsync(filter);
                var monthlyTrends = filter.BuildingId.HasValue ?
                    await _financeService.GetMonthlyTrendsAsync(filter.BuildingId.Value, DateTime.Now.Year) : null;

                var comprehensiveDashboard = new
                {
                    Dashboard = dashboardResult.Data,
                    MonthlyPayments = monthlyPayments.Data,
                    OverduePayments = overduePayments.Data,
                    Statistics = statistics.Data,
                    MonthlyTrends = monthlyTrends?.Data,
                    LastUpdated = DateTime.Now
                };

                return Ok(ApiResponse<object>.SuccessResult("Tüm finansal veriler başarıyla getirildi.", comprehensiveDashboard));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult($"Veriler getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("monthly-payments")]
        public async Task<IActionResult> GetMonthlyPayments(int buildingId, int month, int year)
        {
            var result = await _financeService.GetMonthlyPaymentsAsync(buildingId, month, year);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingFinance(int buildingId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var result = await _financeService.GetBuildingFinanceAsync(buildingId, startDate, endDate);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("apartment/{apartmentId}")]
        public async Task<IActionResult> GetApartmentFinance(int apartmentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var result = await _financeService.GetApartmentFinanceAsync(apartmentId, startDate, endDate);
            return result.Success ? Ok(result) : BadRequest(result);
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

        [HttpGet("monthly-trends/{buildingId}/{year}")]
        public async Task<IActionResult> GetMonthlyTrends(int buildingId, int year)
        {
            var result = await _financeService.GetMonthlyTrendsAsync(buildingId, year);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("calculate-penalty/{paymentId}")]
        public async Task<IActionResult> CalculateDelayPenalty(int paymentId)
        {
            var result = await _financeService.CalculateDelayPenaltyAsync(paymentId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("calculate-delayed-days/{paymentId}")]
        public async Task<IActionResult> CalculateDelayedDays(int paymentId)
        {
            var result = await _financeService.CalculateDelayedDaysAsync(paymentId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("calculate-total-debt/{apartmentId}")]
        public async Task<IActionResult> CalculateTotalDebt(int apartmentId)
        {
            var result = await _financeService.CalculateTotalDebtAsync(apartmentId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("collection-rate/{buildingId}")]
        public async Task<IActionResult> GetCollectionRate(int buildingId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var result = await _financeService.CalculateCollectionRateAsync(buildingId, startDate, endDate);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}