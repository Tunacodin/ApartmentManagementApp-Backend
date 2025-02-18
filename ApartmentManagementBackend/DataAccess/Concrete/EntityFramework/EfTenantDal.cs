using Core.DataAccess;

using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfTenantDal : EfEntityRepositoryBase<Tenant, ApartmentManagementDbContext>, ITenantDal
    {
        public EfTenantDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}
