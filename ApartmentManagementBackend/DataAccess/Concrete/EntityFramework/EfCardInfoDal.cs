using Core.DataAccess;

using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfCardInfoDal : EfEntityRepositoryBase<CardInfo, ApartmentManagementDbContext>, ICardInfoDal
    {
    }
}
