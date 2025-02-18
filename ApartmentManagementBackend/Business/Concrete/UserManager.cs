using Business.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly IUserDal _userDal;

        public UserManager(IUserDal userDal)
        {
            _userDal = userDal;
        }

        public void Add(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            _userDal.Add(user);
        }

        public void Delete(User user)
        {
            if (user == null || user.Id <= 0)
                throw new ArgumentException("Invalid user.");

            _userDal.Delete(user);
        }

        public User? Get(Expression<Func<User, bool>> filter)
        {
            return _userDal.Get(filter);
        }

        public List<User>? GetAll(Expression<Func<User, bool>>? filter = null)
        {
            return _userDal.GetAll(filter);
        }

        public void Update(User user)
        {
            if (user == null || user.Id <= 0)
                throw new ArgumentException("Invalid user.");

            _userDal.Update(user);
        }

        public User? ValidateUser(string email, string password)
        {
            var user = _userDal.Get(u => u.Email == email);
            if (user != null && user.Password == password) // Şifre doğrulaması yapılır
            {
                return user;
            }

            return null; // Kullanıcı bulunamadıysa veya şifre hatalıysa
        }
    }
}
