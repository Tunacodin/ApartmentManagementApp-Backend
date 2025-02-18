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

        [HttpPost("notifications")]
        public IActionResult CreateNotification([FromBody] Notification notification)
        {
            try
            {
                _adminService.CreateNotification(notification);
                return Ok("Notification created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating notification: {ex.Message}");
                return StatusCode(500, "Error creating notification");
            }
        }

        [HttpPost("meetings")]
        public IActionResult ScheduleMeeting([FromBody] Meeting meeting)
        {
            try
            {
                _adminService.ScheduleMeeting(meeting);
                return Ok("Meeting scheduled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error scheduling meeting: {ex.Message}");
                return StatusCode(500, "Error scheduling meeting");
            }
        }

        [HttpPost("apartments/{apartmentId}/owner/{ownerId}")]
        public IActionResult AssignOwner(int apartmentId, int ownerId)
        {
            try
            {
                _adminService.AssignOwnerToApartment(ownerId, apartmentId);
                return Ok("Owner assigned successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning owner: {ex.Message}");
                return StatusCode(500, "Error assigning owner");
            }
        }

        [HttpPost("apartments/{apartmentId}/tenant/{tenantId}")]
        public IActionResult AssignTenant(int apartmentId, int tenantId)
        {
            try
            {
                _adminService.AssignTenantToApartment(tenantId, apartmentId);
                return Ok("Tenant assigned successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning tenant: {ex.Message}");
                return StatusCode(500, "Error assigning tenant");
            }
        }

        [HttpPost("tenant-requests/{requestId}/approve")]
        public IActionResult ApproveTenantRequest(int requestId)
        {
            try
            {
                _adminService.ApproveTenantRequest(requestId);
                return Ok("Tenant request approved");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error approving tenant request: {ex.Message}");
                return StatusCode(500, "Error approving request");
            }
        }

        [HttpPost("tenant-requests/{requestId}/reject")]
        public IActionResult RejectTenantRequest(int requestId, [FromBody] string reason)
        {
            try
            {
                _adminService.RejectTenantRequest(requestId, reason);
                return Ok("Tenant request rejected");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting tenant request: {ex.Message}");
                return StatusCode(500, "Error rejecting request");
            }
        }
    }
}
