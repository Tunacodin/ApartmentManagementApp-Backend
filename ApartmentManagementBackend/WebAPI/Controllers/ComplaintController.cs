using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Entities.DTOs;
using Entities.Enums;

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

                _logger.LogInformation("Successfully retrieved complaint details for building {BuildingId}", buildingId);

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
            try
            {
                var result = await _complaintService.GetComplaintDetailAsync(id);
                if (!result.Success || result.Data == null)
                {
                    return NotFound(result);
                }

                // Şikayet durumuna göre günleri hesapla
                var complaint = result.Data;
                if (complaint.Status == (int)ComplaintStatus.Resolved || complaint.Status == (int)ComplaintStatus.Rejected)
                {
                    // Çözülmüş veya reddedilmiş şikayetler için çözülme tarihine kadar olan günleri hesapla
                    complaint.DaysOpen = complaint.ResolvedAt.HasValue
                        ? (int)(complaint.ResolvedAt.Value - complaint.CreatedAt).TotalDays
                        : 0;
                }
                else
                {
                    // Açık veya işlemdeki şikayetler için bugüne kadar olan günleri hesapla
                    complaint.DaysOpen = (int)(DateTime.Now - complaint.CreatedAt).TotalDays;
                }

                // Status text'i güncelle
                complaint.StatusText = complaint.Status switch
                {
                    (int)ComplaintStatus.Resolved => "Çözüldü",
                    (int)ComplaintStatus.InProgress => "İşlemde",
                    (int)ComplaintStatus.Rejected => "Reddedildi",
                    _ => "Açık"
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting complaint {id}");
                return StatusCode(500, new { message = "Şikayet detayları alınırken hata oluştu", error = ex.Message });
            }
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

        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessComplaint(int id, [FromQuery] int adminId)
        {
            try
            {
                _logger.LogInformation($"Processing complaint {id} by admin {adminId}");

                // Şikayet detaylarını al
                var complaintDetail = await _complaintService.GetComplaintDetailAsync(id);
                if (!complaintDetail.Success || complaintDetail.Data == null)
                {
                    _logger.LogWarning($"Complaint {id} not found");
                    return BadRequest(complaintDetail);
                }

                // Şikayeti işleme al
                var result = await _complaintService.ProcessComplaintAsync(id, adminId);
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to process complaint {id}: {result.Message}");
                    return BadRequest(result);
                }

                // Tenant'a bildirim gönder
                var notification = new Notification
                {
                    Title = "Şikayetiniz İşleme Alındı",
                    Message = $"'{complaintDetail.Data.Subject}' başlıklı şikayetiniz işleme alındı",
                    UserId = complaintDetail.Data.UserId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                await _notificationService.CreateNotificationAsync(notification);
                _logger.LogInformation($"Complaint {id} processed successfully");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing complaint {id}");
                return StatusCode(500, new { message = "Şikayet işleme alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("{id}/resolve")]
        [Consumes("application/json")]
        public async Task<IActionResult> ResolveComplaint(int id, [FromQuery] int adminId)
        {
            try
            {
                _logger.LogInformation($"Resolving complaint {id} by admin {adminId}");

                if (id <= 0)
                {
                    _logger.LogWarning($"Invalid complaint ID: {id}");
                    return BadRequest("Geçersiz şikayet ID'si");
                }

                if (adminId <= 0)
                {
                    _logger.LogWarning($"Invalid admin ID: {adminId}");
                    return BadRequest("Geçersiz admin ID'si");
                }

                // Şikayet detaylarını al
                var complaintDetail = await _complaintService.GetComplaintDetailAsync(id);
                if (!complaintDetail.Success || complaintDetail.Data == null)
                {
                    _logger.LogWarning($"Complaint {id} not found");
                    return BadRequest(complaintDetail);
                }

                _logger.LogInformation($"Found complaint: {complaintDetail.Data.Subject}");

                // Şikayeti çöz
                var result = await _complaintService.ResolveComplaintAsync(id, adminId, "Şikayet çözüldü");
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to resolve complaint {id}: {result.Message}");
                    return BadRequest(result);
                }

                // Tenant'a bildirim gönder
                var notification = new Notification
                {
                    Title = "Şikayetiniz Çözüldü",
                    Message = $"'{complaintDetail.Data.Subject}' başlıklı şikayetiniz çözüldü.",
                    UserId = complaintDetail.Data.UserId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                await _notificationService.CreateNotificationAsync(notification);
                _logger.LogInformation($"Complaint {id} resolved successfully");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error resolving complaint {id}. Error: {ex.Message}, StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Şikayet çözülürken hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectComplaint(int id, [FromQuery] int adminId, [FromBody] RejectComplaintDto rejectDto)
        {
            try
            {
                _logger.LogInformation($"Rejecting complaint {id} by admin {adminId}");

                // Şikayet detaylarını al
                var complaintDetail = await _complaintService.GetComplaintDetailAsync(id);
                if (!complaintDetail.Success || complaintDetail.Data == null)
                {
                    _logger.LogWarning($"Complaint {id} not found");
                    return BadRequest(complaintDetail);
                }

                // Şikayeti reddet
                var result = await _complaintService.RejectComplaintAsync(id, adminId, rejectDto.Reason);
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to reject complaint {id}: {result.Message}");
                    return BadRequest(result);
                }

                // Tenant'a bildirim gönder
                var notification = new Notification
                {
                    Title = "Şikayetiniz Reddedildi",
                    Message = $"'{complaintDetail.Data.Subject}' başlıklı şikayetiniz reddedildi. Sebep: {rejectDto.Reason}",
                    UserId = complaintDetail.Data.UserId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                await _notificationService.CreateNotificationAsync(notification);
                _logger.LogInformation($"Complaint {id} rejected successfully");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error rejecting complaint {id}");
                return StatusCode(500, new { message = "Şikayet reddedilirken hata oluştu", error = ex.Message });
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

        [HttpGet("building/{buildingId}/pending")]
        public async Task<IActionResult> GetPendingComplaints(int buildingId)
        {
            try
            {
                _logger.LogInformation("Getting pending complaints for building {BuildingId}", buildingId);

                if (buildingId <= 0)
                {
                    _logger.LogWarning("Invalid buildingId: {BuildingId}", buildingId);
                    return BadRequest("Invalid building ID");
                }

                var result = await _complaintService.GetPendingComplaintsAsync(buildingId);

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

                _logger.LogInformation("Successfully retrieved pending complaints for building {BuildingId}", buildingId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending complaints for building {BuildingId}. Error: {Message}",
                    buildingId, ex.Message);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("admin/{adminId}")]
        public async Task<IActionResult> GetComplaintsByAdminId(int adminId)
        {
            try
            {
                _logger.LogInformation("Getting complaints for admin {AdminId}", adminId);

                if (adminId <= 0)
                {
                    _logger.LogWarning("Invalid adminId: {AdminId}", adminId);
                    return BadRequest("Invalid admin ID");
                }

                var result = await _complaintService.GetComplaintsByAdminIdAsync(adminId);

                if (result == null)
                {
                    _logger.LogWarning("Result is null for admin {AdminId}", adminId);
                    return StatusCode(500, "Internal server error - null result");
                }

                if (!result.Success)
                {
                    _logger.LogWarning("Unsuccessful result for admin {AdminId}. Message: {Message}", adminId, result.Message);
                    return BadRequest(result);
                }

                _logger.LogInformation("Successfully retrieved complaints for admin {AdminId}", adminId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints for admin {AdminId}. Error: {Message}",
                    adminId, ex.Message);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}