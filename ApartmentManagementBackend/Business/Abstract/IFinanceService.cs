using Core.Utilities.Results;
using Entities.DTOs;
using System;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IFinanceService
    {
        // Ana Dashboard
        Task<ApiResponse<FinanceManagementDashboardDto>> GetFinanceDashboardAsync(FinanceFilterDto filter);

        // Aylık Ödemeler
        Task<ApiResponse<MonthlyPaymentDto>> GetMonthlyPaymentsAsync(int buildingId, int month, int year);

        // Bina Bazlı Finans
        Task<ApiResponse<BuildingFinanceDto>> GetBuildingFinanceAsync(int buildingId, DateTime startDate, DateTime endDate);

        // Daire Bazlı Finans
        Task<ApiResponse<ApartmentFinanceDto>> GetApartmentFinanceAsync(int apartmentId, DateTime startDate, DateTime endDate);

        // Gecikmiş Ödemeler
        Task<ApiResponse<List<OverduePaymentDto>>> GetOverduePaymentsAsync(FinanceFilterDto filter);

        // Ödeme Geçmişi
        Task<ApiResponse<List<FinancePaymentHistoryDto>>> GetPaymentHistoryAsync(FinanceFilterDto filter);

        // İstatistikler
        Task<ApiResponse<PaymentStatisticsDto>> GetPaymentStatisticsAsync(FinanceFilterDto filter);

        // Aylık Trendler
        Task<ApiResponse<List<MonthlyTrendDto>>> GetMonthlyTrendsAsync(int buildingId, int year);

        // Gecikme Cezası Hesaplama
        Task<ApiResponse<decimal>> CalculateDelayPenaltyAsync(int paymentId);

        // Gecikme Günü Hesaplama
        Task<ApiResponse<int>> CalculateDelayedDaysAsync(int paymentId);

        // Toplam Borç Hesaplama (Ana para + Ceza)
        Task<ApiResponse<decimal>> CalculateTotalDebtAsync(int apartmentId);

        // Tahsilat Oranı Hesaplama
        Task<ApiResponse<decimal>> CalculateCollectionRateAsync(int buildingId, DateTime startDate, DateTime endDate);
    }
}