using Business.Abstract;
using Core.DTOs;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            var user = _userService.ValidateUser(loginDto.Email, loginDto.Password);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            return Ok(new
            {
                Message = "Login successful",
                UserId = user.Id,
                
                Email = user.Email,
                Role = user.Role // Backend role bilgisi döner.
            });
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
