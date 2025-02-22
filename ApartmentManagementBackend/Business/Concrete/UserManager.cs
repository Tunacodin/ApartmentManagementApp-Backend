using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;

using System.Linq.Expressions;

using Core.Utilities.Results;
using Core.Constants;
using Entities.DTOs;

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

        public async Task<ApiResponse<UserDto>> GetByIdAsync(int userId)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<UserDto>.ErrorResult(Messages.UserNotFound);

            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                ProfileImageUrl = user.ProfileImageUrl,
                Description = user.Description,
                ProfileUpdatedAt = user.ProfileUpdatedAt
            };

            return ApiResponse<UserDto>.SuccessResult(Messages.Retrieved, userDto);
        }

        public async Task<ApiResponse<bool>> IsUserActiveAsync(int userId)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            return ApiResponse<bool>.SuccessResult(Messages.Retrieved, user.IsActive);
        }
    }
}
