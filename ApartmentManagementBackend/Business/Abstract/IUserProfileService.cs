using Core.Utilities.Results;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IUserProfileService
    {
        Task<ApiResponse<UserDto>> GetProfileAsync(int userId);
        Task<ApiResponse<bool>> UpdateProfileImageAsync(int userId, string? profileImageUrl);
        Task<ApiResponse<bool>> RemoveProfileImageAsync(int userId);
        Task<ApiResponse<bool>> UpdateDescriptionAsync(int userId, string? description);
        Task<ApiResponse<bool>> UpdateDisplayNameAsync(int userId, string fullName);
        Task<ApiResponse<bool>> UpdateProfileAsync(int userId, UpdateProfileDto profileDto);
    }
}