using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // Get all users
        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _adminService.GetAllUsers();
            if (users == null || users.Count == 0)
            {
                return NotFound("No users found.");
            }
            return Ok(users);
        }

        // Get all buildings
        [HttpGet("buildings")]
        public IActionResult GetAllBuildings()
        {
            var buildings = _adminService.GetAllBuildings();
            if (buildings == null || buildings.Count == 0)
            {
                return NotFound("No buildings found.");
            }
            return Ok(buildings);
        }

        // Get all tenants
        [HttpGet("tenants")]
        public IActionResult GetAllTenants()
        {
            var tenants = _adminService.GetAllTenants();
            if (tenants == null || tenants.Count == 0)
            {
                return NotFound("No tenants found.");
            }
            return Ok(tenants);
        }

        // Delete a user
        [HttpDelete("users/{userId}")]
        public IActionResult DeleteUser(int userId)
        {
            try
            {
                _adminService.DeleteUser(userId);
                return Ok("User deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // Delete a building
        [HttpDelete("buildings/{buildingId}")]
        public IActionResult DeleteBuilding(int buildingId)
        {
            try
            {
                _adminService.DeleteBuilding(buildingId);
                return Ok("Building deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // Delete a tenant
        [HttpDelete("tenants/{tenantId}")]
        public IActionResult DeleteTenant(int tenantId)
        {
            try
            {
                _adminService.DeleteTenant(tenantId);
                return Ok("Tenant deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
