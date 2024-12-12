
using Core.DataAccess;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfUserDal :EfEntityRepositoryBase<User,ApartmentManagementDbContext>, IUserDal
    {
      
    }

    
}
