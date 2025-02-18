using System;
using System.Collections.Generic;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface IPaymentService
    {
        void Add(Payment payment);
        void Update(Payment payment);
        void Delete(int id);
        List<Payment> GetAll();
        List<Payment> GetByUserId(int userId);
        List<Payment> GetByDateRange(DateTime startDate, DateTime endDate);
        List<Payment> GetOverduePayments();
        decimal GetTotalPaymentsByUser(int userId);
    }
}