using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComplaintController : ControllerBase
    {
        private readonly IComplaintService _complaintService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ComplaintController> _logger;

        public ComplaintController(
            IComplaintService complaintService,
            INotificationService notificationService,
            ILogger<ComplaintController> logger)
        {
            _complaintService = complaintService;
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingComplaints(int buildingId)
        {
            try
            {
                _logger.LogInformation("Getting complaints for building {BuildingId}", buildingId);

                if (buildingId <= 0)
                {
                    _logger.LogWarning("Invalid buildingId: {BuildingId}", buildingId);
                    return BadRequest("Invalid building ID");
                }

                var result = await _complaintService.GetBuildingComplaintsAsync(buildingId);

                if (result == null)
                {
                    _logger.LogWarning("Result is null for building {BuildingId}", buildingId);
                    return StatusCode(500, "Internal server error - null result");
                }

                if (!result.Success)
                {
                    _logger.LogWarning("Unsuccessful result for building {BuildingId}. Message: {Message}", buildingId, result.Message);
                    return BadRequest(result);
                }

                _logger.LogInformation("Successfully retrieved {Count} complaints for building {BuildingId}",
                    result.Data?.Count ?? 0, buildingId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints for building {BuildingId}. Error: {Message}",
                    buildingId, ex.Message);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _complaintService.GetComplaintDetailAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserComplaints(int userId)
        {
            var result = await _complaintService.GetUserComplaintsAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Complaint complaint)
        {
            try
            {
                if (complaint == null)
                {
                    return BadRequest("Complaint data cannot be null");
                }

                if (complaint.BuildingId <= 0)
                {
                    return BadRequest("Invalid BuildingId");
                }

                if (complaint.UserId <= 0)
                {
                    return BadRequest("Invalid UserId");
                }

                if (string.IsNullOrEmpty(complaint.Subject))
                {
                    return BadRequest("Subject is required");
                }

                if (string.IsNullOrEmpty(complaint.Description))
                {
                    return BadRequest("Description is required");
                }

                var result = await _complaintService.CreateComplaintAsync(complaint);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                if (result.Data == null)
                {
                    return StatusCode(500, "Failed to create complaint");
                }

                _logger.LogInformation($"Complaint created successfully. ID: {result.Data.Id}");
                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating complaint: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error while creating complaint", error = ex.Message });
            }
        }

        [HttpPost("{id}/resolve")]
        public async Task<IActionResult> Resolve(int id, [FromQuery] int adminId)
        {
            try
            {
                // Get complaint details first to access the subject and userId
                var complaintDetail = await _complaintService.GetComplaintDetailAsync(id);
                if (!complaintDetail.Success || complaintDetail.Data == null)
                {
                    return BadRequest(complaintDetail);
                }

                // Resolve the complaint
                var result = await _complaintService.ResolveComplaintAsync(id, adminId);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                // Create and send notification to the tenant
                var notification = new Notification
                {
                    Title = "Şikayet İşleme Alındı",
                    Message = $"{complaintDetail.Data.Subject ?? "Bilinmeyen konu"} şikayetiniz işleme alındı",
                    UserId = complaintDetail.Data.UserId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                await _notificationService.CreateNotificationAsync(notification);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resolving complaint: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error while resolving complaint", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _complaintService.DeleteComplaintAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("building/{buildingId}/active/count")]
        public async Task<IActionResult> GetActiveComplaintsCount(int buildingId)
        {
            var result = await _complaintService.GetActiveComplaintsCountAsync(buildingId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}