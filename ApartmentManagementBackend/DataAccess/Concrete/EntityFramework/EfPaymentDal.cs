using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfPaymentDal : EfEntityRepositoryBase<Payment, ApartmentManagementDbContext>, IPaymentDal
    {
        public EfPaymentDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}