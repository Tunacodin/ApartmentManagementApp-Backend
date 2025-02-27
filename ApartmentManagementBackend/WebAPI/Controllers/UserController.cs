using Business.Abstract;
using Core.DTOs;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            try 
            {
                if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    _logger.LogWarning("Boş kimlik bilgileriyle giriş denemesi yapıldı");
                    return BadRequest("Email ve Şifre gereklidir.");
                }

                _logger.LogInformation("Kullanıcı girişi deneniyor: {Email}", loginDto.Email);
                
                var user = _userService.ValidateUser(loginDto.Email, loginDto.Password);

                if (user == null)
                {
                    _logger.LogWarning("Başarısız giriş denemesi - Kullanıcı: {Email}", loginDto.Email);
                    return Unauthorized("Geçersiz email veya şifre.");
                }

                var adminId = user.Role == "admin" ? user.Id : (int?)null;
                _logger.LogInformation(
                    "Başarılı giriş - Kullanıcı: {Email}, Rol: {Role}, KullanıcıId: {UserId}, AdminId: {AdminId}",
                    user.Email,
                    user.Role,
                    user.Id,
                    adminId
                );

                var response = new
                {
                    Message = "Login successful",
                    UserId = user.Id,
                    Email = user.Email,
                    Role = user.Role,
                    AdminId = adminId
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Giriş işlemi sırasında hata oluştu: {Message}", ex.Message);
                return StatusCode(500, "Giriş sırasında bir hata oluştu");
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
    }
}
