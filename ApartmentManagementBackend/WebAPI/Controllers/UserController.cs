using Business.Abstract;
using Core.DTOs;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Core.Utilities.Security;
using Core.Utilities.Security.JWT;
using Microsoft.AspNetCore.Identity;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<UserController> _logger;
        private readonly IJwtHelper _jwtHelper;

        public UserController(IUserService userService, IPasswordHasher passwordHasher, ILogger<UserController> logger, IJwtHelper jwtHelper)
        {
            _userService = userService;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation($"Login attempt for email: {loginDto.Email}");

                if (loginDto == null)
                {
                    _logger.LogWarning("Login attempt with null loginDto");
                    return BadRequest(new { message = "Login bilgileri boş olamaz" });
                }

                var user = _userService.GetByEmail(loginDto.Email);
                if (user == null || string.IsNullOrEmpty(user.Password) || string.IsNullOrEmpty(user.Email))
                {
                    _logger.LogWarning($"User not found for email: {loginDto.Email}");
                    return Unauthorized(new { message = "Kullanıcı bulunamadı" });
                }

                _logger.LogInformation($"User found: {user.Email}, Password length: {user.Password?.Length ?? 0}");

                var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user.Password!, loginDto.Password);
                if (passwordVerificationResult != Core.Utilities.Security.PasswordVerificationResult.Success)
                {
                    _logger.LogWarning($"Invalid password for user: {user.Email}");
                    return Unauthorized(new { message = "Geçersiz şifre" });
                }

                var token = _jwtHelper.CreateToken(user.Id, user.Email!, user.Role ?? "user");
                _logger.LogInformation($"Login successful for user: {user.Email}");

                var response = new
                {
                    message = "Giriş başarılı",
                    token = token,
                    userId = user.Id,
                    email = user.Email,
                    role = user.Role,
                    adminId = user.AdminId
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login işlemi sırasında hata oluştu");
                return StatusCode(500, new { message = "Beklenmeyen bir hata oluştu", error = ex.Message });
            }
        }

        // Get all users
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            if (users != null && users.Any())
            {
                return Ok(users); // 200 OK
            }
            return NotFound("No users found."); // 404 Not Found
        }

        // Get user by UserId
        [HttpGet("{userId}")]
        public IActionResult GetById(int userId)
        {
            var user = _userService.Get(u => u.Id == userId);
            if (user != null)
            {
                return Ok(user); // 200 OK
            }
            return NotFound($"User with UserId {userId} not found."); // 404 Not Found
        }

        // Add new user
        [HttpPost]
        public IActionResult Add([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest("User object is null."); // 400 Bad Request
            }

            _userService.Add(user);
            return Created("", "User added successfully."); // 201 Created
        }

        // Update user
        [HttpPut("{userId}")]
        public IActionResult Update(int userId, [FromBody] User user)
        {
            if (user == null || user.Id != userId)
            {
                return BadRequest("Invalid user data."); // 400 Bad Request
            }

            _userService.Update(user);
            return Ok("User updated successfully."); // 200 OK
        }

        // Delete user
        [HttpDelete("{userId}")]
        public IActionResult Delete(int userId)
        {
            var user = _userService.Get(u => u.Id == userId);
            if (user == null)
            {
                return NotFound($"User with UserId {userId} not found."); // 404 Not Found
            }

            _userService.Delete(user);
            return Ok("User deleted successfully."); // 200 OK
        }

        [HttpPost("hash-passwords")]
        public IActionResult HashAllPasswords()
        {
            try
            {
                var users = _userService.GetAll();
                foreach (var user in users)
                {
                    if (!string.IsNullOrEmpty(user.Password))
                    {
                        user.Password = _passwordHasher.HashPassword(user.Password);
                        _userService.Update(user);
                    }
                }
                return Ok(new { message = "Tüm şifreler başarıyla hash'lendi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre hash'leme işlemi sırasında hata oluştu");
                return StatusCode(500, new { message = "Beklenmeyen bir hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = _userService.GetByEmail(resetPasswordDto.Email);
                if (user == null)
                    return NotFound("Bu email adresi ile kayıtlı kullanıcı bulunamadı");

                // Yeni şifreyi hash'le
                user.Password = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);
                _userService.Update(user);

                _logger.LogInformation($"Şifre sıfırlama başarılı. Email: {resetPasswordDto.Email}");
                return Ok("Şifreniz başarıyla güncellendi");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Şifre sıfırlama hatası. Email: {resetPasswordDto.Email}");
                return StatusCode(500, "Şifre sıfırlanırken hata oluştu");
            }
        }
    }
}
