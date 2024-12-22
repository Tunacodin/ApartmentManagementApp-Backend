using Entities.Concrete;
using Microsoft.Data.SqlClient;
using System.Linq.Expressions;

public interface IUserDal:IEntityRepository<User>
{
  
}
