using Core.DataAccess;
using Entities.Concrete;


namespace DataAccess.Concrete.EntityFramework
{
    public class EfUserDal : EfEntityRepositoryBase<User, ApartmentManagementDbContext>, IUserDal
    {
        public EfUserDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }


}
