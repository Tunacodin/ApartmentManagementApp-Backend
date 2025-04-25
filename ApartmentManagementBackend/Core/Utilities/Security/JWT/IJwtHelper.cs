using Core.Entities.Concrete;

namespace Core.Utilities.Security.JWT
{
    public interface IJwtHelper
    {
        string CreateToken(int userId, string email, string role);
    }
}