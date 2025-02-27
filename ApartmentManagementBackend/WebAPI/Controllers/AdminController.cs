using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Core.Constants;
using Entities.DTOs;
using Core.Utilities.Results;
using Business.ValidationRules.FluentValidation;

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

        [HttpPost("initialize")]
        public async Task<IActionResult> InitializeFirstAdmin([FromBody] AdminDto adminDto)
        {
            try
            {
                // Sistemde admin var mı kontrol et
                var existingAdmins = await _adminService.GetAllAsync();
                if (existingAdmins.Success && existingAdmins.Data != null && existingAdmins.Data.Any())
                {
                    return BadRequest(ApiResponse<string>.ErrorResult("Sistemde zaten admin bulunmaktadır."));
                }

                // Validasyon
                var validator = new AdminDtoValidator();
                var validationResult = await validator.ValidateAsync(adminDto);

                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                    var response = new
                    {
                        Message = Messages.ValidationFailed,
                        Errors = errors,
                        Example = new
                        {
                            FullName = "Ahmet Yılmaz",
                            Email = "ornek@email.com",
                            PhoneNumber = "05351234567",
                            Password = "Test123",
                            ProfileImageUrl = "https://example.com/profile.jpg",
                            Description = "Sistem yöneticisi"
                        }
                    };
                    return BadRequest(response);
                }

                // İlk admini ekle
                adminDto.Role = "admin";
                adminDto.IsActive = true;
                var result = await _adminService.AddAsync(adminDto);

                return result.Success && result.Data != null
                    ? CreatedAtAction(nameof(GetById), new { id = result.Data.Id },
                        ApiResponse<AdminDto>.SuccessResult("İlk admin başarıyla oluşturuldu", result.Data))
                    : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error initializing first admin: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _adminService.GetAllAsync();
            return result.Success
                ? Ok(ApiResponse<List<AdminListDto>>.SuccessResult(Messages.AdminsListed, result.Data))
                : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _adminService.GetByIdAsync(id);
            return result.Success
                ? Ok(ApiResponse<AdminDetailDto>.SuccessResult(Messages.AdminRetrieved, result.Data))
                : BadRequest(ApiResponse<AdminDetailDto>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AdminDto adminDto)
        {
            try
            {
                var validator = new AdminDtoValidator();
                var validationResult = await validator.ValidateAsync(adminDto);

                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                    var response = new
                    {
                        Message = Messages.ValidationFailed,
                        Errors = errors,
                        Example = new
                        {
                            FullName = "Ahmet Yılmaz",
                            Email = "ornek@email.com",
                            PhoneNumber = "05351234567",
                            Password = "Test123",
                            ProfileImageUrl = "https://example.com/profile.jpg",
                            Description = "Sistem yöneticisi"
                        }
                    };
                    return BadRequest(response);
                }

                var result = await _adminService.AddAsync(adminDto);
                return result.Success && result.Data != null
                    ? CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, ApiResponse<AdminDto>.SuccessResult(Messages.AdminAdded, result.Data))
                    : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding admin: {ex.Message}");
                return BadRequest(ApiResponse<AdminDto>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AdminDto adminDto)
        {
            if (id != adminDto.Id)
            {
                return BadRequest(ApiResponse<AdminDto>.ErrorResult(Messages.IdMismatch));
            }

            var result = await _adminService.UpdateAsync(adminDto);
            return result.Success
                ? Ok(ApiResponse<AdminDto>.SuccessResult(Messages.AdminUpdated, result.Data))
                : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _adminService.DeleteAsync(id);
            return result.Success
                ? Ok(ApiResponse<bool>.SuccessResult(Messages.AdminDeleted, true))
                : BadRequest(result);
        }

        [HttpGet("dashboard/{adminId}")]
        public async Task<IActionResult> GetDashboard(int adminId)
        {
            var result = await _adminService.GetDashboardAsync(adminId);
            return result.Success
                ? Ok(ApiResponse<AdminDashboardDto>.SuccessResult(Messages.Success, result.Data))
                : BadRequest(result);
        }

        [HttpGet("{adminId}/buildings")]
        public async Task<IActionResult> GetManagedBuildings(int adminId)
        {
            var result = await _adminService.GetManagedBuildingsAsync(adminId);
            return result.Success
                ? Ok(ApiResponse<List<AdminManagedBuildingDto>>.SuccessResult(Messages.BuildingsListed, result.Data))
                : BadRequest(result);
        }

        [HttpPost("{adminId}/buildings/{buildingId}/assign")]
        public async Task<IActionResult> AssignBuildingAsync(int adminId, int buildingId)
        {
            var result = await _adminService.AssignBuildingAsync(adminId, buildingId);
            return result.Success
                ? Ok(ApiResponse<BuildingAssignmentResultDto>.SuccessResult(Messages.BuildingAssigned,
                    new BuildingAssignmentResultDto
                    {
                        AdminId = adminId,
                        BuildingId = buildingId,
                        IsAssigned = true,
                        AssignmentDate = DateTime.Now
                    }))
                : BadRequest(ApiResponse<BuildingAssignmentResultDto>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpPost("{adminId}/buildings/{buildingId}/unassign")]
        public async Task<IActionResult> UnassignBuildingAsync(int adminId, int buildingId)
        {
            var result = await _adminService.UnassignBuildingAsync(adminId, buildingId);
            return result.Success
                ? Ok(ApiResponse<BuildingAssignmentResultDto>.SuccessResult(Messages.BuildingUnassigned,
                    new BuildingAssignmentResultDto
                    {
                        AdminId = adminId,
                        BuildingId = buildingId,
                        IsAssigned = false,
                        AssignmentDate = DateTime.Now
                    }))
                : BadRequest(ApiResponse<BuildingAssignmentResultDto>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpGet("{adminId}/activities")]
        public async Task<IActionResult> GetRecentActivities(int adminId, [FromQuery] int count = 10)
        {
            var result = await _adminService.GetRecentActivitiesAsync(adminId, count);
            return result.Success
                ? Ok(ApiResponse<List<RecentActivityDto>>.SuccessResult(Messages.AdminActivitiesListed, result.Data))
                : BadRequest(ApiResponse<List<RecentActivityDto>>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpGet("{adminId}/financial-summaries")]
        public async Task<IActionResult> GetFinancialSummaries(int adminId)
        {
            var result = await _adminService.GetFinancialSummariesAsync(adminId);
            return result.Success
                ? Ok(ApiResponse<List<FinancialSummaryDto>>.SuccessResult(Messages.AdminFinancialSummaryRetrieved, result.Data))
                : BadRequest(ApiResponse<List<FinancialSummaryDto>>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpPut("{adminId}/profile")]
        public async Task<IActionResult> UpdateProfile(int adminId, [FromBody] UpdateProfileDto profileDto)
        {
            var result = await _adminService.UpdateProfileAsync(adminId, profileDto.ProfileImageUrl, profileDto.Description);
            return result.Success
                ? Ok(ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true))
                : BadRequest(ApiResponse<bool>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpPut("{adminId}/password")]
        public async Task<IActionResult> UpdatePassword(int adminId, [FromBody] UpdatePasswordDto passwordDto)
        {
            var result = await _adminService.UpdatePasswordAsync(adminId, passwordDto.CurrentPassword, passwordDto.NewPassword);
            return result.Success
                ? Ok(ApiResponse<bool>.SuccessResult(Messages.PasswordUpdated, true))
                : BadRequest(ApiResponse<bool>.ErrorResult(
                    result.Message == Messages.InvalidCurrentPassword
                        ? Messages.InvalidCurrentPassword
                        : Messages.AdminNotFound));
        }

        [HttpPut("{adminId}/contact")]
        public async Task<IActionResult> UpdateContactInfo(int adminId, [FromBody] UpdateContactDto contactDto)
        {
            var result = await _adminService.UpdateContactInfoAsync(adminId, contactDto.Email, contactDto.PhoneNumber);
            return result.Success
                ? Ok(ApiResponse<bool>.SuccessResult(Messages.ContactInfoUpdated, true))
                : BadRequest(ApiResponse<bool>.ErrorResult(Messages.AdminNotFound));
        }

        [HttpGet("{adminId}/statistics")]
        public async Task<IActionResult> GetStatistics(int adminId)
        {
            var statistics = new
            {
                TotalResidents = (await _adminService.GetTotalResidentsAsync(adminId)).Data,
                ActiveComplaints = (await _adminService.GetActiveComplaintsCountAsync(adminId)).Data,
                PendingPayments = (await _adminService.GetPendingPaymentsCountAsync(adminId)).Data,
                UpcomingMeetings = (await _adminService.GetUpcomingMeetingsCountAsync(adminId)).Data
            };

            return Ok(ApiResponse<object>.SuccessResult(Messages.AdminStatisticsRetrieved, statistics));
        }

        [HttpPost("notifications")]
        public IActionResult CreateNotification([FromBody] Notification notification)
        {
            try
            {
                _adminService.CreateNotification(notification);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.NotificationSent, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating notification: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("meetings")]
        public IActionResult ScheduleMeeting([FromBody] Meeting meeting)
        {
            try
            {
                _adminService.ScheduleMeeting(meeting);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.MeetingScheduled, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error scheduling meeting: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("apartments/{apartmentId}/owner/{ownerId}")]
        public IActionResult AssignOwner(int apartmentId, int ownerId)
        {
            try
            {
                _adminService.AssignOwnerToApartment(ownerId, apartmentId);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.OwnerAdded, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning owner: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("apartments/{apartmentId}/tenant/{tenantId}")]
        public IActionResult AssignTenant(int apartmentId, int tenantId)
        {
            try
            {
                _adminService.AssignTenantToApartment(tenantId, apartmentId);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.TenantAdded, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning tenant: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("tenant-requests/{requestId}/approve")]
        public IActionResult ApproveTenantRequest(int requestId)
        {
            try
            {
                _adminService.ApproveTenantRequest(requestId);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.Success, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error approving tenant request: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("tenant-requests/{requestId}/reject")]
        public IActionResult RejectTenantRequest(int requestId, [FromBody] string reason)
        {
            try
            {
                _adminService.RejectTenantRequest(requestId, reason);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.Success, true));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting tenant request: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}
