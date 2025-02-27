using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfPaymentDal : EfEntityRepositoryBase<Payment, ApartmentManagementDbContext>, IPaymentDal
    {
        public EfPaymentDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public async Task<List<MonthlyIncomeDto>> GetMonthlyIncomeAsync(int adminId)
        {
            try
            {
                return await _context.Payments
                    .Where(p => _context.Tenants
                        .Where(t => _context.Apartments
                            .Where(a => _context.Buildings
                                .Where(b => b.AdminId == adminId)
                                .Select(b => b.Id)
                                .Contains(a.BuildingId))
                            .Select(a => a.Id)
                            .Contains(t.ApartmentId))
                        .Select(t => t.Id)
                        .Contains(p.UserId))
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
                var tenantIds = await _context.Tenants
                    .Where(t => _context.Apartments
                        .Where(a => _context.Buildings
                            .Where(b => b.AdminId == adminId)
                            .Select(b => b.Id)
                            .Contains(a.BuildingId))
                        .Select(a => a.Id)
                        .Contains(t.ApartmentId))
                    .Select(t => t.Id)
                    .ToListAsync();

                if (!tenantIds.Any())
                {
                    return new PaymentStatisticsDto();
                }

                var stats = new PaymentStatisticsDto
                {
                    Paid = await _context.Payments
                        .CountAsync(p => tenantIds.Contains(p.UserId) && p.IsPaid),
                    
                    Pending = await _context.Payments
                        .CountAsync(p => tenantIds.Contains(p.UserId) && !p.IsPaid && p.DueDate > DateTime.Now),
                    
                    Overdue = await _context.Payments
                        .CountAsync(p => tenantIds.Contains(p.UserId) && !p.IsPaid && p.DueDate <= DateTime.Now),
                    
                    TotalCollected = await _context.Payments
                        .Where(p => tenantIds.Contains(p.UserId) && p.IsPaid)
                        .SumAsync(p => p.Amount),
                    
                    TotalPending = await _context.Payments
                        .Where(p => tenantIds.Contains(p.UserId) && !p.IsPaid)
                        .SumAsync(p => p.Amount)
                };
                
                return stats;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting payment statistics: {ex.Message}", ex);
            }
        }
    }
}