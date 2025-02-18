using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfOwnerDal : EfEntityRepositoryBase<Owner, ApartmentManagementDbContext>, IOwnerDal
    {
        public EfOwnerDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}