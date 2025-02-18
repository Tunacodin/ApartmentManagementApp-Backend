using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfApartmentDal : EfEntityRepositoryBase<Apartment, ApartmentManagementDbContext>, IApartmentDal
    {
        public EfApartmentDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}