using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.DTOs;
using Core.Constants;
using Core.Utilities.Results;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ILogger<UserProfileController> _logger;

        public UserProfileController(IUserProfileService userProfileService, ILogger<UserProfileController> logger)
        {
            _userProfileService = userProfileService;
            _logger = logger;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var result = await _userProfileService.GetProfileAsync(userId);
            return result.Success
                ? Ok(result)
                : NotFound(result);
        }

        [HttpPut("{userId}/profile-image")]
        public async Task<IActionResult> UpdateProfileImage(int userId, [FromBody] string? profileImageUrl)
        {
            var result = await _userProfileService.UpdateProfileImageAsync(userId, profileImageUrl);
            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }

        [HttpDelete("{userId}/profile-image")]
        public async Task<IActionResult> RemoveProfileImage(int userId)
        {
            var result = await _userProfileService.RemoveProfileImageAsync(userId);
            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }

        [HttpPut("{userId}/description")]
        public async Task<IActionResult> UpdateDescription(int userId, [FromBody] string? description)
        {
            var result = await _userProfileService.UpdateDescriptionAsync(userId, description);
            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }

        [HttpPut("{userId}/display-name")]
        public async Task<IActionResult> UpdateDisplayName(int userId, [FromBody] string displayName)
        {
            var result = await _userProfileService.UpdateDisplayNameAsync(userId, displayName);
            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileDto profileDto)
        {
            var result = await _userProfileService.UpdateProfileAsync(userId, profileDto);
            return result.Success
                ? Ok(result)
                : BadRequest(result);
        }
    }
}