using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfMeetingDal : EfEntityRepositoryBase<Meeting, ApartmentManagementDbContext>, IMeetingDal
    {
        public EfMeetingDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}