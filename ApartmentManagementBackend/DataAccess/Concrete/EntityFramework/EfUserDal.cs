using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfUserDal : EfEntityRepositoryBase<User, ApartmentManagementDbContext>, IUserDal
    {
        public EfUserDal(ApartmentManagementDbContext context) : base(context)
        {
        }
    }
}
