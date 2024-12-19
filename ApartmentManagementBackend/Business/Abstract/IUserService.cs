using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Business.Abstract
{
    public interface IUserService
    {
        void Add(User user);
        void Update(User user);
        void Delete(User user);
        User Get(Expression<Func<User, bool>> filter);
        List<User> GetAll(Expression<Func<User, bool>> filter = null);

        User ValidateCredentials(string email, string password);

        string GeneratePasswordResetToken(string email);

        void SendPasswordResetEmail(string email, string resetToken);


    }
}
