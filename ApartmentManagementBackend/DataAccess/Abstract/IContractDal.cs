using System;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DataAccess;
using Entities.Concrete;

namespace DataAccess.Abstract
{
    public interface IContractDal : IEntityRepository<Contract>
    {
        // Add only methods that are not in IEntityRepository
        // Empty for now since all needed methods are inherited
    }
} 