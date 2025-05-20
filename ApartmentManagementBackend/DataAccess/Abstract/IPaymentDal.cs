using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IPaymentDal : IEntityRepository<Payment>
    {
        Task<List<MonthlyIncomeReportDto>> GetMonthlyIncomeAsync(int adminId);
        Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int adminId);
        Task<BuildingPaymentStatisticsDto> GetBuildingPaymentStatisticsAsync(int buildingId);
        Task<List<TopDebtorDto>> GetTopDebtorsAsync(int adminId, int count);
        Task<List<TopPayerDto>> GetTopPayersAsync(int adminId, int count);
        Task<List<MonthlyCollectionRateDto>> GetMonthlyCollectionRatesAsync(int adminId);
        Task<List<Payment>> GetListAsync(Expression<Func<Payment, bool>> filter = null);
    }
}