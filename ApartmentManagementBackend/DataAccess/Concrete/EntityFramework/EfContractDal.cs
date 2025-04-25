
using DataAccess.Abstract;
using Entities.Concrete;
using Core.DataAccess;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfContractDal : EfEntityRepositoryBase<Contract, ApartmentManagementDbContext>, IContractDal
    {
        public EfContractDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        // Add specific methods if needed in the future
    }
}