using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;


namespace DataAccess.Concrete.EntityFramework
{
    public class EfBuildingDal : EfEntityRepositoryBase<Building, ApartmentManagementDbContext>, IBuildingDal
    {
        public EfBuildingDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}
