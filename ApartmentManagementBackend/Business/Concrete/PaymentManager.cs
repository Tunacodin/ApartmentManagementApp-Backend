using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;

namespace Business.Concrete
{
    public class PaymentManager : IPaymentService
    {
        private readonly IPaymentDal _paymentDal;

        public PaymentManager(IPaymentDal paymentDal)
        {
            _paymentDal = paymentDal;
        }

        public void Add(Payment payment)
        {
            payment.PaymentDate = DateTime.Now;
            _paymentDal.Add(payment);
        }

        public void Update(Payment payment)
        {
            _paymentDal.Update(payment);
        }

        public void Delete(int id)
        {
            var payment = _paymentDal.Get(p => p.Id == id);
            if (payment != null)
                _paymentDal.Delete(payment);
        }

        public List<Payment> GetAll()
        {
            return _paymentDal.GetAll();
        }

        public List<Payment> GetByUserId(int userId)
        {
            return _paymentDal.GetAll(p => p.UserId == userId);
        }

        public List<Payment> GetByDateRange(DateTime startDate, DateTime endDate)
        {
            return _paymentDal.GetAll(p => p.PaymentDate >= startDate && p.PaymentDate <= endDate);
        }

        public List<Payment> GetOverduePayments()
        {
            return _paymentDal.GetAll(p => p.DueDate < DateTime.Now && !p.IsPaid);
        }

        public decimal GetTotalPaymentsByUser(int userId)
        {
            return _paymentDal.GetAll(p => p.UserId == userId && p.IsPaid)
                             .Sum(p => p.Amount);
        }
    }
} 