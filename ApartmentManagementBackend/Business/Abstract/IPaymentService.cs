using System;
using System.Collections.Generic;
using Entities.Concrete;
using System.Threading.Tasks;
using Core.Utilities.Results;
using Business.Abstract;
using DataAccess.Abstract;
using Core.Constants;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IPaymentService
    {
        Task<ApiResponse<bool>> AddAsync(Payment payment);
        Task<ApiResponse<bool>> UpdateAsync(Payment payment);
        void Delete(int id);
        List<Payment> GetAll();
        Task<ApiResponse<List<Payment>>> GetByUserIdAsync(int userId);
        List<Payment> GetByDateRange(DateTime startDate, DateTime endDate);
        List<Payment> GetOverduePayments();
        decimal GetTotalPaymentsByUser(int userId);
        Task<ApiResponse<bool>> CalculateDelayPenalty(int paymentId);
        Task<ApiResponse<int>> GetDelayedDays(int paymentId);
        Task<ApiResponse<decimal>> GetDelayPenaltyAmount(int paymentId);
        Task<ApiResponse<PaymentDto>> ProcessPaymentAsync(int tenantId, int paymentId);
    }
}