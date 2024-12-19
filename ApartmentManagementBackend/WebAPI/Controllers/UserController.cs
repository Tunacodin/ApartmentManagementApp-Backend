using Business.Abstract;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using Core.DTOs;
namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Create a new user (Registration)
        [HttpPost("create")]
        public IActionResult Create([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest("User object is null."); // 400 Bad Request
            }

            _userService.Add(user);
            return Created("", "User registered successfully."); // 201 Created
        }

        // Login
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto userLogin)
        {
            if (userLogin == null)
            {
                return BadRequest("Login data is null."); // 400 Bad Request
            }

            var user = _userService.ValidateCredentials(userLogin.Email, userLogin.Password);
            if (user != null)
            {
                return Ok(new { message = "Login successful.", user }); // 200 OK
            }

            return Unauthorized("Invalid email or password."); // 401 Unauthorized
        }

        // Forgot Password
        [HttpPost("forgotpassword")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (forgotPasswordDto == null || string.IsNullOrEmpty(forgotPasswordDto.Email))
            {
                return BadRequest("Invalid data."); // 400 Bad Request
            }

            var user = _userService.Get(u => u.Email == forgotPasswordDto.Email);
            if (user == null)
            {
                return NotFound("User not found."); // 404 Not Found
            }

            // Generate reset token (logic can be added here)
            var resetToken = _userService.GeneratePasswordResetToken(user.Email);
            // Send email with reset token (mock or actual implementation)
            _userService.SendPasswordResetEmail(user.Email, resetToken);

            return Ok("Password reset instructions sent to your email."); // 200 OK
        }
    }
}
