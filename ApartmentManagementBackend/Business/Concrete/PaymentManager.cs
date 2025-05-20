using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Core.Utilities.Results;
using Core.Constants;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class PaymentManager : IPaymentService
    {
        private readonly IPaymentDal _paymentDal;
        private readonly IMapper _mapper;
        private readonly ILogger<PaymentManager> _logger;
        private readonly IContractDal _contractDal;
        private const decimal DAILY_PENALTY_RATE = 0.001m; // Günlük %0.1 gecikme cezası

        public PaymentManager(IPaymentDal paymentDal, IContractDal contractDal, IMapper mapper, ILogger<PaymentManager> logger)
        {
            _paymentDal = paymentDal;
            _contractDal = contractDal;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ApiResponse<bool>> AddAsync(Payment payment)
        {
            try
            {
                payment.PaymentDate = DateTime.Now;
                await _paymentDal.AddAsync(payment);
                return ApiResponse<bool>.SuccessResult(Messages.PaymentAdded, true);
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Payment add error: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> UpdateAsync(Payment payment)
        {
            try
            {
                await _paymentDal.UpdateAsync(payment);
                return ApiResponse<bool>.SuccessResult(Messages.PaymentUpdated, true);
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Payment update error: {ex.Message}");
            }
        }

        public void Delete(int id)
        {
            var payment = _paymentDal.Get(p => p.Id == id);
            if (payment != null)
                _paymentDal.Delete(payment);
        }

        public List<Payment> GetAll()
        {
            var payments = _paymentDal.GetAll();
            return payments ?? new List<Payment>();
        }

        public async Task<ApiResponse<List<Payment>>> GetByUserIdAsync(int userId)
        {
            try
            {
                var payments = await _paymentDal.GetAllAsync(p => p.UserId == userId);
                return ApiResponse<List<Payment>>.SuccessResult(Messages.PaymentsListed, payments ?? new List<Payment>());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<Payment>>.ErrorResult($"Error getting user payments: {ex.Message}");
            }
        }

        public List<Payment> GetByDateRange(DateTime startDate, DateTime endDate)
        {
            var payments = _paymentDal.GetAll(p => p.PaymentDate >= startDate && p.PaymentDate <= endDate);
            return payments ?? new List<Payment>();
        }

        public List<Payment> GetOverduePayments()
        {
            var payments = _paymentDal.GetAll(p => p.DueDate < DateTime.Now && !p.IsPaid);
            return payments ?? new List<Payment>();
        }

        public decimal GetTotalPaymentsByUser(int userId)
        {
            var payments = _paymentDal.GetAll(p => p.UserId == userId && p.IsPaid);
            return payments?.Sum(p => p.Amount) ?? 0;
        }

        public async Task<ApiResponse<bool>> CalculateDelayPenalty(int paymentId)
        {
            var payment = await _paymentDal.GetAsync(p => p.Id == paymentId);
            if (payment == null)
                return ApiResponse<bool>.ErrorResult(Messages.PaymentNotFound);

            if (payment.IsPaid && payment.PaymentDate > payment.DueDate)
            {
                payment.DelayedDays = (int)(payment.PaymentDate - payment.DueDate).TotalDays;
                payment.DelayPenaltyAmount = payment.Amount * payment.DelayedDays.Value * DAILY_PENALTY_RATE;
                payment.TotalAmount = payment.Amount + payment.DelayPenaltyAmount;

                await _paymentDal.UpdateAsync(payment);
                return ApiResponse<bool>.SuccessResult(Messages.PaymentDelayed, true);
            }

            return ApiResponse<bool>.SuccessResult(Messages.PaymentOnTime, true);
        }

        public async Task<ApiResponse<int>> GetDelayedDays(int paymentId)
        {
            var payment = await _paymentDal.GetAsync(p => p.Id == paymentId);
            if (payment == null)
                return ApiResponse<int>.ErrorResult(Messages.PaymentNotFound);

            return ApiResponse<int>.SuccessResult(Messages.Retrieved, payment.DelayedDays ?? 0);
        }

        public async Task<ApiResponse<decimal>> GetDelayPenaltyAmount(int paymentId)
        {
            var payment = await _paymentDal.GetAsync(p => p.Id == paymentId);
            if (payment == null)
                return ApiResponse<decimal>.ErrorResult(Messages.PaymentNotFound);

            return ApiResponse<decimal>.SuccessResult(Messages.Retrieved, payment.DelayPenaltyAmount ?? 0);
        }

        public async Task<ApiResponse<PaymentDto>> ProcessPaymentAsync(int tenantId, int paymentId)
        {
            try
            {
                var payment = await _paymentDal.GetAsync(p => p.Id == paymentId && p.UserId == tenantId);
                if (payment == null)
                    return ApiResponse<PaymentDto>.ErrorResult(Messages.PaymentNotFound);

                // Ödeme işlemini gerçekleştir
                payment.IsPaid = true;
                payment.PaymentDate = DateTime.Now;
                await _paymentDal.UpdateAsync(payment);

                // PaymentDto'ya dönüştür
                var paymentDto = _mapper.Map<PaymentDto>(payment);
                return ApiResponse<PaymentDto>.SuccessResult(Messages.PaymentProcessed, paymentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ödeme işlemi sırasında hata oluştu");
                return ApiResponse<PaymentDto>.ErrorResult(Messages.PaymentFailed);
            }
        }
    }
}