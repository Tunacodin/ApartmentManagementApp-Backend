using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IPaymentDal : IEntityRepository<Payment>
    {
        Task<List<MonthlyIncomeDto>> GetMonthlyIncomeAsync(int adminId);
        Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int adminId);
    }
}