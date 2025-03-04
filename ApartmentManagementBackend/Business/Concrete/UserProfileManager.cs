using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Concrete
{
    public class UserProfileManager : IUserProfileService
    {
        private readonly IUserDal _userDal;

        public UserProfileManager(IUserDal userDal)
        {
            _userDal = userDal;
        }

        public async Task<ApiResponse<UserDto>> GetProfileAsync(int userId)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<UserDto>.ErrorResult(Messages.UserNotFound);

            var profileDto = new UserDto
            {
                Id = user.Id,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                ProfileImageUrl = user.ProfileImageUrl,
                Description = user.Description,
                ProfileUpdatedAt = user.ProfileUpdatedAt,
                Details = new UserDetailsDto()
            };

            // Only populate relevant details based on user role
            switch (user.Role?.ToLower())
            {
                case "owner":
                    var owner = user as Owner;
                    if (owner != null)
                    {
                        profileDto.Details.IBAN = owner.IBAN;
                        profileDto.Details.BankName = owner.BankName;
                    }
                    break;

                case "tenant":
                    var tenant = user as Tenant;
                    if (tenant != null)
                    {
                        profileDto.Details.ApartmentId = tenant.ApartmentId;
                        profileDto.Details.LeaseStartDate = tenant.LeaseStartDate;
                        profileDto.Details.LeaseEndDate = tenant.LeaseEndDate;
                        profileDto.Details.MonthlyRent = tenant.MonthlyRent;
                    }
                    break;

                case "security":
                    var security = user as Security;
                    if (security != null)
                    {
                        profileDto.Details.BuildingId = security.BuildingId;
                        profileDto.Details.ShiftHours = security.ShiftHours;
                    }
                    break;
            }

            return ApiResponse<UserDto>.SuccessResult(Messages.Success, profileDto);
        }

        public async Task<ApiResponse<bool>> UpdateProfileImageAsync(int userId, string? profileImageUrl)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            user.ProfileImageUrl = profileImageUrl;
            user.ProfileUpdatedAt = DateTime.Now;
            await _userDal.UpdateAsync(user);

            return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
        }

        public async Task<ApiResponse<bool>> RemoveProfileImageAsync(int userId)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            user.ProfileImageUrl = null;
            user.ProfileUpdatedAt = DateTime.Now;
            await _userDal.UpdateAsync(user);

            return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
        }

        public async Task<ApiResponse<bool>> UpdateDescriptionAsync(int userId, string? description)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            user.Description = description;
            user.ProfileUpdatedAt = DateTime.Now;
            await _userDal.UpdateAsync(user);

            return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
        }

        public async Task<ApiResponse<bool>> UpdateDisplayNameAsync(int userId, string fullName)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            var nameParts = fullName.Split(' ');
            user.FirstName = nameParts[0];
            user.LastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : null;
            user.ProfileUpdatedAt = DateTime.Now;
            await _userDal.UpdateAsync(user);

            return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
        }

        public async Task<ApiResponse<bool>> UpdateProfileAsync(int userId, UpdateProfileDto profileDto)
        {
            var user = await _userDal.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResult(Messages.UserNotFound);

            user.ProfileImageUrl = profileDto.ProfileImageUrl;
            user.Description = profileDto.Description;
            user.ProfileUpdatedAt = DateTime.Now;

            await _userDal.UpdateAsync(user);
            return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
        }
    }
}