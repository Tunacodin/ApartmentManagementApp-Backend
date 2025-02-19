using Core.DataAccess;
using Entities.Concrete;
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace DataAccess.Abstract
{
    public interface ITenantDal : IEntityRepository<Tenant>
    {
    }
}
