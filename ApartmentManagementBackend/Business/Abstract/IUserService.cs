using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Core.Utilities.Results;
using Entities.DTOs;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IUserService
    {
        void Add(User user);
        void Update(User user);
        void Delete(User user);
        User? Get(Expression<Func<User, bool>> filter);
        List<User>? GetAll(Expression<Func<User, bool>>? filter = null);

        User? ValidateUser(string email, string password);

        Task<ApiResponse<UserDto>> GetByIdAsync(int userId);
        Task<ApiResponse<bool>> IsUserActiveAsync(int userId);
    }
}
