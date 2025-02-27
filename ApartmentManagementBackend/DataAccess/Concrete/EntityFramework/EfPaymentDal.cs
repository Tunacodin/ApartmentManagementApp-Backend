using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfPaymentDal : EfEntityRepositoryBase<Payment, ApartmentManagementDbContext>, IPaymentDal
    {
        private readonly ILogger<EfPaymentDal> _logger;

        public EfPaymentDal(ApartmentManagementDbContext context, ILogger<EfPaymentDal> logger) : base(context)
        {
            _logger = logger;
        }

        public async Task<List<MonthlyIncomeDto>> GetMonthlyIncomeAsync(int adminId)
        {
            try
            {
                return await _context.Payments
                    .Where(p => _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(p.BuildingId))
                    .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                    .Select(g => new MonthlyIncomeDto
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        TotalAmount = g.Sum(p => p.Amount),
                        PaidAmount = g.Where(p => p.IsPaid).Sum(p => p.Amount),
                        UnpaidAmount = g.Where(p => !p.IsPaid).Sum(p => p.Amount)
                    })
                    .OrderByDescending(m => m.Year)
                    .ThenByDescending(m => m.Month)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting monthly income: {ex.Message}", ex);
            }
        }

        public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int adminId)
        {
            try
            {
                var now = DateTime.Now;
                var payments = await _context.Payments
                    .Where(p => _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(p.BuildingId))
                    .ToListAsync();

                if (!payments.Any())
                {
                    return new PaymentStatisticsDto();
                }

                var stats = new PaymentStatisticsDto
                {
                    // General Payment Statistics
                    TotalPaymentCount = payments.Count,
                    TotalCollected = payments.Where(p => p.IsPaid).Sum(p => p.Amount),
                    TotalPending = payments.Where(p => !p.IsPaid).Sum(p => p.Amount),
                    Paid = payments.Count(p => p.IsPaid),
                    Pending = payments.Count(p => !p.IsPaid && p.DueDate > now),
                    Overdue = payments.Count(p => !p.IsPaid && p.DueDate <= now),

                    // Delay and Penalty Analysis
                    TotalDelayedPayments = payments.Count(p => p.IsPaid && p.PaymentDate > p.DueDate),
                    TotalDelayedDays = payments
                        .Where(p => p.IsPaid && p.PaymentDate > p.DueDate)
                        .Sum(p => (int)(p.PaymentDate - p.DueDate).TotalDays),
                    TotalPenaltyAmount = payments.Sum(p => p.DelayPenaltyAmount ?? 0),

                    // Payment Rate Analysis
                    OnTimePaymentRate = payments.Any() ?
                        (decimal)payments.Count(p => p.IsPaid && p.PaymentDate <= p.DueDate) / payments.Count * 100 : 0,
                    DelayedPaymentRate = payments.Any() ?
                        (decimal)payments.Count(p => p.IsPaid && p.PaymentDate > p.DueDate) / payments.Count * 100 : 0,
                    UnpaidPaymentRate = payments.Any() ?
                        (decimal)payments.Count(p => !p.IsPaid) / payments.Count * 100 : 0,

                    // Payment Type Analysis
                    TotalRentAmount = payments.Where(p => p.PaymentType.ToLower() == "rent").Sum(p => p.Amount),
                    TotalDuesAmount = payments.Where(p => p.PaymentType.ToLower() == "dues").Sum(p => p.Amount),
                    UnpaidRentAmount = payments.Where(p => !p.IsPaid && p.PaymentType.ToLower() == "rent").Sum(p => p.Amount),
                    UnpaidDuesAmount = payments.Where(p => !p.IsPaid && p.PaymentType.ToLower() == "dues").Sum(p => p.Amount)
                };

                // Calculate Average Delay Days
                if (stats.TotalDelayedPayments > 0)
                {
                    stats.AverageDelayDays = (decimal)stats.TotalDelayedDays / stats.TotalDelayedPayments;
                }

                // Get Top Defaulters
                stats.TopDefaulters = await _context.Payments
                    .Where(p => !p.IsPaid && _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(p.BuildingId))
                    .GroupBy(p => new { p.UserId, p.UserFullName })
                    .Select(g => new PaymentDefaulterDto
                    {
                        UserId = g.Key.UserId,
                        UserFullName = g.Key.UserFullName,
                        TotalDebt = g.Sum(p => p.Amount),
                        DelayedDays = g.Sum(p => p.DelayedDays ?? 0)
                    })
                    .OrderByDescending(d => d.TotalDebt)
                    .Take(10)
                    .ToListAsync();

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Detailed error in GetPaymentStatisticsAsync: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<BuildingPaymentStatisticsDto> GetBuildingPaymentStatisticsAsync(int buildingId)
        {
            try
            {
                var building = await _context.Buildings
                    .FirstOrDefaultAsync(b => b.Id == buildingId);

                if (building == null)
                    return new BuildingPaymentStatisticsDto 
                    { 
                        BuildingId = buildingId,
                        BuildingName = "Unknown"
                    };

                var payments = await _context.Payments
                    .Where(p => p.BuildingId == buildingId)
                    .ToListAsync();

                return new BuildingPaymentStatisticsDto
                {
                    BuildingId = buildingId,
                    BuildingName = building.BuildingName,
                    TotalCollected = payments.Where(p => p.IsPaid).Sum(p => p.Amount),
                    TotalPending = payments.Where(p => !p.IsPaid).Sum(p => p.Amount),
                    PaidCount = payments.Count(p => p.IsPaid),
                    PendingCount = payments.Count(p => !p.IsPaid && p.DueDate > DateTime.Now),
                    OverdueCount = payments.Count(p => !p.IsPaid && p.DueDate <= DateTime.Now),
                    CollectionRate = payments.Any() ? 
                        (decimal)payments.Count(p => p.IsPaid) / payments.Count * 100 : 0
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting building payment statistics: {ex.Message}", ex);
            }
        }

        public async Task<List<TopDebtorDto>> GetTopDebtorsAsync(int adminId, int count)
        {
            try
            {
                return await _context.Payments
                    .Where(p => !p.IsPaid && _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(p.BuildingId))
                    .GroupBy(p => new { p.UserId, p.UserFullName, p.ApartmentId })
                    .Select(g => new TopDebtorDto
                    {
                        UserId = g.Key.UserId,
                        FullName = g.Key.UserFullName,
                        ApartmentInfo = $"Daire {g.Key.ApartmentId}",
                        TotalDebt = g.Sum(p => p.Amount),
                        OverdueDays = g.Sum(p => p.DelayedDays ?? 0),
                        OverduePaymentCount = g.Count()
                    })
                    .OrderByDescending(d => d.TotalDebt)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting top debtors: {ex.Message}", ex);
            }
        }

        public async Task<List<TopPayerDto>> GetTopPayersAsync(int adminId, int count)
        {
            try
            {
                return await _context.Payments
                    .Where(p => p.IsPaid && _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(p.BuildingId))
                    .GroupBy(p => new { p.UserId, p.UserFullName, p.ApartmentId })
                    .Select(g => new TopPayerDto
                    {
                        UserId = g.Key.UserId,
                        FullName = g.Key.UserFullName,
                        ApartmentInfo = $"Daire {g.Key.ApartmentId}",
                        TotalPaid = g.Sum(p => p.Amount),
                        OnTimePaymentCount = g.Count(p => p.PaymentDate <= p.DueDate),
                        OnTimePaymentRate = (decimal)g.Count(p => p.PaymentDate <= p.DueDate) / g.Count() * 100
                    })
                    .OrderByDescending(d => d.TotalPaid)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting top payers: {ex.Message}", ex);
            }
        }

        public async Task<List<MonthlyCollectionRateDto>> GetMonthlyCollectionRatesAsync(int adminId)
        {
            return await _context.Payments
                .Where(p => _context.Buildings
                    .Where(b => b.AdminId == adminId)
                    .Select(b => b.Id)
                    .Contains(p.BuildingId))
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new MonthlyCollectionRateDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalAmount = g.Sum(p => p.Amount),
                    CollectedAmount = g.Where(p => p.IsPaid).Sum(p => p.Amount),
                    TotalPaymentCount = g.Count(),
                    PaidPaymentCount = g.Count(p => p.IsPaid),
                    CollectionRate = g.Any() ? (decimal)g.Count(p => p.IsPaid) / g.Count() * 100 : 0
                })
                .OrderByDescending(m => m.Year)
                .ThenByDescending(m => m.Month)
                .ToListAsync();
        }
    }
}