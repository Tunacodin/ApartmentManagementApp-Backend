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
            return await _context.Payments
                .Where(p => p.BuildingId == adminId && p.IsPaid)
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new MonthlyIncomeDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month}",
                    Amount = g.Sum(p => p.Amount)
                })
                .OrderByDescending(m => m.Month)
                .Take(12)
                .ToListAsync();
        }

        public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int adminId)
        {
            var stats = new PaymentStatisticsDto
            {
                Paid = await _context.Payments.CountAsync(p => p.BuildingId == adminId && p.IsPaid),
                Pending = await _context.Payments.CountAsync(p => p.BuildingId == adminId && !p.IsPaid && p.DueDate > DateTime.Now),
                Overdue = await _context.Payments.CountAsync(p => p.BuildingId == adminId && !p.IsPaid && p.DueDate <= DateTime.Now),
                TotalCollected = await _context.Payments.Where(p => p.BuildingId == adminId && p.IsPaid).SumAsync(p => p.Amount),
                TotalPending = await _context.Payments.Where(p => p.BuildingId == adminId && !p.IsPaid).SumAsync(p => p.Amount)
            };
            return stats;
        }
    }
}