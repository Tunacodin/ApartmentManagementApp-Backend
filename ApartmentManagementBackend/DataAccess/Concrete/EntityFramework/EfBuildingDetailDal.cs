using Core.DataAccess;

using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EFBuildingDetailDal : EfEntityRepositoryBase<BuildingDetail, ApartmentManagementDbContext>, IBuildingDetailDal
    {
    }
}
