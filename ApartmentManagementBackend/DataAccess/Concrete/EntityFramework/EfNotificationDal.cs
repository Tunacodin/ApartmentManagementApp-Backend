using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfNotificationDal : EfEntityRepositoryBase<Notification, ApartmentManagementDbContext>, INotificationDal
    {
        public EfNotificationDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
} 