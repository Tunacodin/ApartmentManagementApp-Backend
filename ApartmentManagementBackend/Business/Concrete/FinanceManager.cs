using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class FinanceManager : IFinanceService
    {
        private readonly IPaymentDal _paymentDal;
        private readonly IBuildingDal _buildingDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly ILogger<FinanceManager> _logger;
        private const decimal DAILY_PENALTY_RATE = 0.001m; // Günlük %0.1 gecikme cezası

        public FinanceManager(
            IPaymentDal paymentDal,
            IBuildingDal buildingDal,
            IApartmentDal apartmentDal,
            ILogger<FinanceManager> logger)
        {
            _paymentDal = paymentDal;
            _buildingDal = buildingDal;
            _apartmentDal = apartmentDal;
            _logger = logger;
        }

        public async Task<ApiResponse<FinanceManagementDashboardDto>> GetFinanceDashboardAsync(FinanceFilterDto filter)
        {
            try
            {
                _logger.LogInformation($"Getting finance dashboard with filter: BuildingId={filter.BuildingId}, StartDate={filter.StartDate}, EndDate={filter.EndDate}");

                var dashboard = new FinanceManagementDashboardDto();

                // Varsayılan tarih aralığını ayarla
                filter.StartDate ??= DateTime.Now.AddMonths(-1);
                filter.EndDate ??= DateTime.Now;

                // Bina bazlı finansal verileri getir
                if (!filter.BuildingId.HasValue)
                {
                    // Eğer bina ID'si belirtilmemişse, tüm binaların özetini getir
                    var buildings = await _buildingDal.GetAllAsync();
                    var buildingFinances = new List<BuildingFinanceDto>();

                    foreach (var building in buildings)
                    {
                        var buildingFinance = await GetBuildingFinanceAsync(building.Id, filter.StartDate.Value, filter.EndDate.Value);
                        if (buildingFinance.Success)
                            buildingFinances.Add(buildingFinance.Data);
                    }

                    dashboard.BuildingFinances = buildingFinances;

                    // Genel özeti hesapla
                    var totalExpectedIncome = buildingFinances.Sum(b => b.MonthlyExpectedIncome);
                    var totalCollectedAmount = buildingFinances.Sum(b => b.MonthlyCollectedAmount);

                    dashboard.Summary = new FinancialSummaryDto
                    {
                        BuildingName = "Tüm Binalar",
                        ExpectedIncome = Math.Round(totalExpectedIncome, 0),
                        CollectedAmount = Math.Round(totalCollectedAmount, 0),
                        PendingAmount = Math.Round(totalExpectedIncome - totalCollectedAmount, 0),
                        CollectionRate = totalExpectedIncome > 0
                            ? Math.Round((totalCollectedAmount / totalExpectedIncome) * 100, 0)
                            : 0,
                        TotalPayments = buildingFinances.Sum(b => b.TotalApartments),
                        PendingPayments = buildingFinances.Sum(b => b.UnpaidApartments)
                    };
                }
                else
                {
                    var buildingFinance = await GetBuildingFinanceAsync(filter.BuildingId.Value, filter.StartDate.Value, filter.EndDate.Value);
                    if (buildingFinance.Success)
                    {
                        dashboard.BuildingFinances = new List<BuildingFinanceDto> { buildingFinance.Data };
                        dashboard.Summary = new FinancialSummaryDto
                        {
                            BuildingName = buildingFinance.Data.BuildingName,
                            ExpectedIncome = Math.Round(buildingFinance.Data.MonthlyExpectedIncome, 0),
                            CollectedAmount = Math.Round(buildingFinance.Data.MonthlyCollectedAmount, 0),
                            PendingAmount = Math.Round(buildingFinance.Data.MonthlyExpectedIncome - buildingFinance.Data.MonthlyCollectedAmount, 0),
                            CollectionRate = Math.Round(buildingFinance.Data.CollectionRate, 0),
                            TotalPayments = buildingFinance.Data.TotalApartments,
                            PendingPayments = buildingFinance.Data.UnpaidApartments
                        };
                    }
                }

                // Aylık ödemeleri getir
                var currentDate = DateTime.Now;
                var monthlyPayments = await GetMonthlyPaymentsAsync(
                    filter.BuildingId ?? 0,
                    currentDate.Month,
                    currentDate.Year);

                if (monthlyPayments.Success)
                    dashboard.MonthlyPayments = new List<MonthlyPaymentDto> { monthlyPayments.Data };

                // Gecikmiş ödemeleri getir
                var overduePayments = await GetOverduePaymentsAsync(filter);
                if (overduePayments.Success)
                    dashboard.OverduePayments = overduePayments.Data;

                // İstatistikleri getir
                var statistics = await GetPaymentStatisticsAsync(filter);
                if (statistics.Success)
                    dashboard.Statistics = statistics.Data;

                // Pagination metadata'yı ayarla
                dashboard.Pagination = new PaginationMetadata
                {
                    CurrentPage = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalCount = dashboard.OverduePayments.Count,
                    TotalPages = (int)Math.Ceiling(dashboard.OverduePayments.Count / (double)filter.PageSize)
                };

                return ApiResponse<FinanceManagementDashboardDto>.SuccessResult("Finans verileri başarıyla getirildi.", dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting finance dashboard: {ex.Message}");
                return ApiResponse<FinanceManagementDashboardDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<MonthlyPaymentDto>> GetMonthlyPaymentsAsync(int buildingId, int month, int year)
        {
            try
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                // Tüm ödemeleri getir (ödenen ve ödenmeyen)
                var payments = await _paymentDal.GetAllAsync(p =>
                    (buildingId == 0 || p.BuildingId == buildingId) &&
                    p.DueDate >= startDate &&
                    p.DueDate <= endDate);

                if (payments == null || !payments.Any())
                    payments = new List<Payment>();

                // Detaylı ödeme bilgilerini hazırla
                var paymentDetails = new List<PaymentDetailDto>();
                foreach (var payment in payments)
                {
                    var apartment = await _apartmentDal.GetAsync(a => a.Id == payment.ApartmentId);
                    var building = await _buildingDal.GetAsync(b => b.Id == payment.BuildingId);
                    paymentDetails.Add(new PaymentDetailDto
                    {
                        Id = payment.Id,
                        UserFullName = payment.UserFullName,
                        PaymentType = payment.PaymentType,
                        Amount = Math.Round(payment.Amount, 0),
                        PaymentDate = payment.PaymentDate,
                        DueDate = payment.DueDate,
                        IsPaid = payment.IsPaid,
                        Description = payment.Description,
                        UserEmail = apartment?.Status ?? "Bilinmiyor",
                        UserPhoneNumber = apartment?.UnitNumber.ToString() ?? "Bilinmiyor"
                    });
                }

                var totalExpectedAmount = Math.Round(payments.Sum(p => p.Amount), 0);
                var totalCollectedAmount = Math.Round(payments.Where(p => p.IsPaid).Sum(p => p.Amount), 0);

                var monthlyPayment = new MonthlyPaymentDto
                {
                    Month = month,
                    Year = year,
                    TotalExpectedAmount = totalExpectedAmount,
                    TotalCollectedAmount = totalCollectedAmount,
                    TotalPaymentCount = payments.Count,
                    CompletedPaymentCount = payments.Count(p => p.IsPaid),
                    PendingPaymentCount = payments.Count(p => !p.IsPaid),
                    Payments = paymentDetails
                };

                monthlyPayment.CollectionRate = totalExpectedAmount > 0
                    ? Math.Round((totalCollectedAmount / totalExpectedAmount) * 100, 0)
                    : 0;

                return ApiResponse<MonthlyPaymentDto>.SuccessResult("Aylık ödeme verileri başarıyla getirildi.", monthlyPayment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting monthly payments: {ex.Message}");
                return ApiResponse<MonthlyPaymentDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<BuildingFinanceDto>> GetBuildingFinanceAsync(int buildingId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var building = await _buildingDal.GetAsync(b => b.Id == buildingId);
                if (building == null)
                    return ApiResponse<BuildingFinanceDto>.ErrorResult("Bina bulunamadı.");

                var apartments = await _apartmentDal.GetAllAsync(a => a.BuildingId == buildingId);
                var payments = await _paymentDal.GetAllAsync(p =>
                    p.BuildingId == buildingId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate <= endDate);

                var monthlyExpectedIncome = Math.Round(payments.Sum(p => p.Amount), 0);
                var monthlyCollectedAmount = Math.Round(payments.Where(p => p.IsPaid).Sum(p => p.Amount), 0);

                var buildingFinance = new BuildingFinanceDto
                {
                    BuildingId = buildingId,
                    BuildingName = building.BuildingName,
                    TotalApartments = apartments.Count,
                    PaidApartments = apartments.Count(a => payments.Any(p => p.ApartmentId == a.Id && p.IsPaid)),
                    UnpaidApartments = apartments.Count(a => payments.Any(p => p.ApartmentId == a.Id && !p.IsPaid)),
                    MonthlyExpectedIncome = monthlyExpectedIncome,
                    MonthlyCollectedAmount = monthlyCollectedAmount
                };

                buildingFinance.CollectionRate = buildingFinance.MonthlyExpectedIncome > 0
                    ? Math.Round((buildingFinance.MonthlyCollectedAmount / buildingFinance.MonthlyExpectedIncome) * 100, 0)
                    : 0;

                return ApiResponse<BuildingFinanceDto>.SuccessResult("Bina finans verileri başarıyla getirildi.", buildingFinance);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building finance: {ex.Message}");
                return ApiResponse<BuildingFinanceDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<decimal>> CalculateDelayPenaltyAsync(int paymentId)
        {
            try
            {
                var payment = await _paymentDal.GetAsync(p => p.Id == paymentId);
                if (payment == null)
                    return ApiResponse<decimal>.ErrorResult("Ödeme bulunamadı.");

                if (!payment.IsPaid)
                {
                    var delayedDays = (int)(DateTime.Now - payment.DueDate).TotalDays;
                    if (delayedDays > 0)
                    {
                        var penaltyAmount = payment.Amount * delayedDays * DAILY_PENALTY_RATE;
                        return ApiResponse<decimal>.SuccessResult("Gecikme cezası hesaplandı.", penaltyAmount);
                    }
                }

                return ApiResponse<decimal>.SuccessResult("Gecikme cezası bulunmamaktadır.", 0);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error calculating delay penalty: {ex.Message}");
                return ApiResponse<decimal>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<OverduePaymentDto>>> GetOverduePaymentsAsync(FinanceFilterDto filter)
        {
            try
            {
                var payments = await _paymentDal.GetAllAsync(p =>
                    (!filter.BuildingId.HasValue || p.BuildingId == filter.BuildingId) &&
                    !p.IsPaid &&
                    p.DueDate < DateTime.Now);

                var overduePayments = new List<OverduePaymentDto>();

                foreach (var payment in payments)
                {
                    var building = await _buildingDal.GetAsync(b => b.Id == payment.BuildingId);
                    var apartment = await _apartmentDal.GetAsync(a => a.Id == payment.ApartmentId);

                    var overduePayment = new OverduePaymentDto
                    {
                        PaymentId = payment.Id,
                        BuildingName = building?.BuildingName ?? "Bilinmiyor",
                        ApartmentNumber = apartment?.UnitNumber.ToString() ?? "Bilinmiyor",
                        TenantName = apartment?.IsOccupied == true ? apartment.Status : "Boş",
                        PaymentType = payment.PaymentType,
                        OriginalAmount = payment.Amount,
                        DueDate = payment.DueDate,
                        DelayedDays = (int)(DateTime.Now - payment.DueDate).TotalDays,
                        DailyPenaltyRate = DAILY_PENALTY_RATE,
                        PenaltyAmount = payment.Amount * (int)(DateTime.Now - payment.DueDate).TotalDays * DAILY_PENALTY_RATE,
                        TotalAmount = payment.Amount + (payment.Amount * (int)(DateTime.Now - payment.DueDate).TotalDays * DAILY_PENALTY_RATE)
                    };

                    overduePayments.Add(overduePayment);
                }

                // Pagination uygula
                overduePayments = overduePayments
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                return ApiResponse<List<OverduePaymentDto>>.SuccessResult("Gecikmiş ödemeler başarıyla getirildi.", overduePayments);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting overdue payments: {ex.Message}");
                return ApiResponse<List<OverduePaymentDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<decimal>> CalculateCollectionRateAsync(int buildingId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var payments = await _paymentDal.GetAllAsync(p =>
                    p.BuildingId == buildingId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate <= endDate);

                var totalExpected = payments.Sum(p => p.Amount);
                var totalCollected = payments.Where(p => p.IsPaid).Sum(p => p.Amount);

                var collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

                return ApiResponse<decimal>.SuccessResult("Tahsilat oranı hesaplandı.", collectionRate);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error calculating collection rate: {ex.Message}");
                return ApiResponse<decimal>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<ApartmentFinanceDto>> GetApartmentFinanceAsync(int apartmentId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var apartment = await _apartmentDal.GetAsync(a => a.Id == apartmentId);
                if (apartment == null)
                    return ApiResponse<ApartmentFinanceDto>.ErrorResult("Daire bulunamadı.");

                var payments = await _paymentDal.GetAllAsync(p =>
                    p.ApartmentId == apartmentId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate <= endDate);

                var lastPayment = payments.OrderByDescending(p => p.PaymentDate).FirstOrDefault();
                var delayedDays = lastPayment != null && !lastPayment.IsPaid ?
                    (int)(DateTime.Now - lastPayment.DueDate).TotalDays : 0;

                var apartmentFinance = new ApartmentFinanceDto
                {
                    ApartmentId = apartmentId,
                    ApartmentNumber = apartment.UnitNumber.ToString(),
                    TenantName = apartment.IsOccupied ? apartment.Status : "Boş",
                    MonthlyDuesAmount = apartment.RentAmount,
                    IsPaid = lastPayment?.IsPaid ?? false,
                    LastPaymentDate = lastPayment?.PaymentDate,
                    DelayedDays = delayedDays,
                    DelayPenaltyAmount = delayedDays > 0 ? lastPayment.Amount * delayedDays * DAILY_PENALTY_RATE : 0,
                    TotalDueAmount = lastPayment?.Amount ?? 0
                };

                return ApiResponse<ApartmentFinanceDto>.SuccessResult("Daire finans verileri başarıyla getirildi.", apartmentFinance);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting apartment finance: {ex.Message}");
                return ApiResponse<ApartmentFinanceDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<FinancePaymentHistoryDto>>> GetPaymentHistoryAsync(FinanceFilterDto filter)
        {
            try
            {
                var payments = await _paymentDal.GetAllAsync(p =>
                    (!filter.BuildingId.HasValue || p.BuildingId == filter.BuildingId) &&
                    (!filter.ApartmentId.HasValue || p.ApartmentId == filter.ApartmentId));

                var history = payments.Select(p => new FinancePaymentHistoryDto
                {
                    PaymentId = p.Id,
                    PaymentDate = p.PaymentDate,
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    WasDelayed = p.PaymentDate > p.DueDate,
                    DelayedDays = p.PaymentDate > p.DueDate ? (int)(p.PaymentDate - p.DueDate).TotalDays : null,
                    PenaltyAmount = p.DelayPenaltyAmount,
                    PaymentStatus = p.IsPaid ? "Ödendi" : "Bekliyor"
                }).ToList();

                return ApiResponse<List<FinancePaymentHistoryDto>>.SuccessResult("Ödeme geçmişi başarıyla getirildi.", history);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting payment history: {ex.Message}");
                return ApiResponse<List<FinancePaymentHistoryDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(FinanceFilterDto filter)
        {
            try
            {
                // Filtre null ise yeni bir instance oluştur
                filter ??= new FinanceFilterDto
                {
                    StartDate = DateTime.Now.AddMonths(-1),
                    EndDate = DateTime.Now,
                    PageNumber = 1,
                    PageSize = 10
                };

                // Varsayılan tarih aralığını ayarla
                filter.StartDate ??= DateTime.Now.AddMonths(-1);
                filter.EndDate ??= DateTime.Now;

                // Ödemeleri getir
                var payments = await _paymentDal.GetAllAsync(p =>
                    (!filter.BuildingId.HasValue || p.BuildingId == filter.BuildingId) &&
                    (!filter.ApartmentId.HasValue || p.ApartmentId == filter.ApartmentId) &&
                    p.PaymentDate >= filter.StartDate &&
                    p.PaymentDate <= filter.EndDate);

                if (payments == null)
                    payments = new List<Payment>();

                // Ödeme tiplerini grupla
                var paymentTypeGroups = payments.GroupBy(p => p.PaymentType)
                    .ToDictionary(g => g.Key, g => Math.Round(g.Sum(p => p.Amount), 0));

                var stats = new PaymentStatisticsDto
                {
                    TotalRevenue = Math.Round(payments.Where(p => p.IsPaid).Sum(p => p.Amount), 0),
                    TotalPendingAmount = Math.Round(payments.Where(p => !p.IsPaid).Sum(p => p.Amount), 0),
                    TotalPenaltyAmount = Math.Round(payments.Sum(p => p.DelayPenaltyAmount ?? 0), 0),
                    TotalPayments = payments.Count,
                    CompletedPayments = payments.Count(p => p.IsPaid),
                    PendingPayments = payments.Count(p => !p.IsPaid),
                    DelayedPayments = payments.Count(p => p.PaymentDate > p.DueDate),
                    AveragePaymentAmount = payments.Any() ? Math.Round(payments.Average(p => p.Amount), 0) : 0,
                    AverageDelayDays = payments.Any(p => p.DelayedDays.HasValue)
                        ? Math.Round((decimal)payments.Where(p => p.DelayedDays.HasValue).Average(p => p.DelayedDays.Value), 0)
                        : 0,
                    PaymentTypeDistribution = paymentTypeGroups,
                    PaymentMethodDistribution = new Dictionary<string, int>
                    {
                        { "Nakit", payments.Count(p => p.IsPaid) },
                        { "Bekleyen", payments.Count(p => !p.IsPaid) }
                    }
                };

                // Aylık trendleri hesapla
                stats.MonthlyTrends = payments
                    .GroupBy(p => new { p.PaymentDate.Month, p.PaymentDate.Year })
                    .Select(g => new MonthlyTrendDto
                    {
                        Month = g.Key.Month,
                        Year = g.Key.Year,
                        TotalAmount = Math.Round(g.Sum(p => p.Amount), 0),
                        PaymentCount = g.Count(),
                        CollectionRate = g.Count() > 0
                            ? Math.Round(g.Count(p => p.IsPaid) * 100.0m / g.Count(), 0)
                            : 0,
                        DelayedPaymentCount = g.Count(p => p.PaymentDate > p.DueDate)
                    })
                    .OrderBy(t => t.Year)
                    .ThenBy(t => t.Month)
                    .ToList();

                if (!stats.MonthlyTrends.Any())
                    stats.MonthlyTrends = new List<MonthlyTrendDto>();

                return ApiResponse<PaymentStatisticsDto>.SuccessResult("Ödeme istatistikleri başarıyla getirildi.", stats);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting payment statistics: {ex.Message}", ex);
                return ApiResponse<PaymentStatisticsDto>.ErrorResult($"Ödeme istatistikleri getirilirken bir hata oluştu: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<MonthlyTrendDto>>> GetMonthlyTrendsAsync(int buildingId, int year)
        {
            try
            {
                var startDate = new DateTime(year, 1, 1);
                var endDate = startDate.AddYears(1).AddDays(-1);

                var payments = await _paymentDal.GetAllAsync(p =>
                    p.BuildingId == buildingId &&
                    p.PaymentDate >= startDate &&
                    p.PaymentDate <= endDate);

                var trends = payments
                    .GroupBy(p => new { p.PaymentDate.Month, p.PaymentDate.Year })
                    .Select(g => new MonthlyTrendDto
                    {
                        Month = g.Key.Month,
                        Year = g.Key.Year,
                        TotalAmount = g.Sum(p => p.Amount),
                        PaymentCount = g.Count(),
                        CollectionRate = g.Count(p => p.IsPaid) * 100.0m / g.Count(),
                        DelayedPaymentCount = g.Count(p => p.PaymentDate > p.DueDate)
                    })
                    .OrderBy(t => t.Year)
                    .ThenBy(t => t.Month)
                    .ToList();

                return ApiResponse<List<MonthlyTrendDto>>.SuccessResult("Aylık trendler başarıyla getirildi.", trends);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting monthly trends: {ex.Message}");
                return ApiResponse<List<MonthlyTrendDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> CalculateDelayedDaysAsync(int paymentId)
        {
            try
            {
                var payment = await _paymentDal.GetAsync(p => p.Id == paymentId);
                if (payment == null)
                    return ApiResponse<int>.ErrorResult("Ödeme bulunamadı.");

                var delayedDays = payment.IsPaid
                    ? (int)(payment.PaymentDate - payment.DueDate).TotalDays
                    : (int)(DateTime.Now - payment.DueDate).TotalDays;

                return ApiResponse<int>.SuccessResult("Gecikme günü hesaplandı.", Math.Max(0, delayedDays));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error calculating delayed days: {ex.Message}");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<decimal>> CalculateTotalDebtAsync(int apartmentId)
        {
            try
            {
                var payments = await _paymentDal.GetAllAsync(p =>
                    p.ApartmentId == apartmentId &&
                    !p.IsPaid);

                var totalDebt = payments.Sum(p => p.Amount + (p.DelayPenaltyAmount ?? 0));

                return ApiResponse<decimal>.SuccessResult("Toplam borç hesaplandı.", totalDebt);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error calculating total debt: {ex.Message}");
                return ApiResponse<decimal>.ErrorResult(Messages.UnexpectedError);
            }
        }

        // Diğer interface metodlarının implementasyonları...
    }
}