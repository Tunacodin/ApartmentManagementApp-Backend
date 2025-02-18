using Core.DataAccess;
using System.Collections.Generic;
using System.Linq.Expressions;
using Entities.Concrete;

namespace DataAccess.Abstract
{
    public interface INotificationDal : IEntityRepository<Notification>
    {
    }
}