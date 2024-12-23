using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        // Get all users
        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            try
            {
                var users = _adminService.GetAllUsers();
                if (users == null || users.Count == 0)
                {
                    return NotFound(new { Message = "No users found." });
                }
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving users: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while retrieving users." });
            }
        }

        // Get all buildings
        [HttpGet("buildings")]
        public IActionResult GetAllBuildings()
        {
            try
            {
                var buildings = _adminService.GetAllBuildings();
                if (buildings == null || buildings.Count == 0)
                {
                    return NotFound(new { Message = "No buildings found." });
                }
                return Ok(buildings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving buildings: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while retrieving buildings." });
            }
        }

        // Get all tenants
        [HttpGet("tenants")]
        public IActionResult GetAllTenants()
        {
            try
            {
                var tenants = _adminService.GetAllTenants();
                if (tenants == null || tenants.Count == 0)
                {
                    return NotFound(new { Message = "No tenants found." });
                }
                return Ok(tenants);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving tenants: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while retrieving tenants." });
            }
        }

        // Delete a user
        [HttpDelete("users/{userId}")]
        public IActionResult DeleteUser(int userId)
        {
            try
            {
                _adminService.DeleteUser(userId);
                return Ok(new { Message = "User deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"User not found: {ex.Message}");
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting user: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while deleting the user." });
            }
        }

        // Delete a building
        [HttpDelete("buildings/{buildingId}")]
        public IActionResult DeleteBuilding(int buildingId)
        {
            try
            {
                _adminService.DeleteBuilding(buildingId);
                return Ok(new { Message = "Building deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"Building not found: {ex.Message}");
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting building: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while deleting the building." });
            }
        }

        // Delete a tenant
        [HttpDelete("tenants/{tenantId}")]
        public IActionResult DeleteTenant(int tenantId)
        {
            try
            {
                _adminService.DeleteTenant(tenantId);
                return Ok(new { Message = "Tenant deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"Tenant not found: {ex.Message}");
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting tenant: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while deleting the tenant." });
            }
        }
    }
}
