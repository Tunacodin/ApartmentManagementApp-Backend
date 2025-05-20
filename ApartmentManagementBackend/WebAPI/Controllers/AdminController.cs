using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Core.Constants;
using Entities.DTOs;
using Core.Utilities.Results;
using Business.ValidationRules.FluentValidation;
using Entities.Enums;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IPaymentService _paymentService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService,
            IPaymentService paymentService,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _paymentService = paymentService;
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
            return result.Success && result.Data != null
                ? Ok(ApiResponse<List<AdminListDto>>.SuccessResult(Messages.AdminsListed, result.Data))
                : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _adminService.GetByIdAsync(id);
            return result.Success && result.Data != null
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
            return result.Success && result.Data != null
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

        [HttpGet("{adminId}/buildings")]
        public async Task<IActionResult> GetManagedBuildings(int adminId)
        {
            var result = await _adminService.GetManagedBuildingsAsync(adminId);
            return result.Success && result.Data != null
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

        [HttpGet("enhanced-dashboard/{adminId}")]
        public async Task<IActionResult> GetEnhancedDashboard(int adminId)
        {
            try
            {
                var admin = await _adminService.GetByIdAsync(adminId);
                if (!admin.Success || admin.Data == null)
                    return BadRequest(ApiResponse<string>.ErrorResult(Messages.AdminNotFound));

                // Ay başı ve sonu
                var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                // Temel istatistikler
                var buildings = await _adminService.GetManagedBuildingsAsync(adminId);
                var totalTenants = await _adminService.GetTotalResidentsAsync(adminId);
                var emptyApartmentsResult = await _adminService.GetEmptyApartmentsCountAsync(adminId);
                var recentPayments = await _adminService.GetLastPaymentsAsync(adminId);
                var recentComplaints = await _adminService.GetLastComplaintsAsync(adminId);
                var monthlyIncome = await _adminService.GetMonthlyIncomeAsync(adminId, startDate, endDate);
                var mostComplainedBuildingResult = await _adminService.GetMostComplainedBuildingAsync(adminId);
                var (building, complaintCount) = mostComplainedBuildingResult.Data;
                var commonComplaintsResult = building != null
                    ? await _adminService.GetCommonComplaintsAsync(building.Id)
                    : ApiResponse<List<string>>.SuccessResult("No complaints", new List<string>());

                var dashboard = new EnhancedDashboardDto
                {
                    TotalBuildings = buildings.Data?.Count ?? 0,
                    TotalTenants = totalTenants.Success ? totalTenants.Data : 0,
                    TotalApartments = buildings.Data?.Sum(b => b.TotalApartments) ?? 0,
                    EmptyApartments = emptyApartmentsResult.Success ? emptyApartmentsResult.Data : 0,
                    MonthlyIncome = monthlyIncome.Success ? monthlyIncome.Data : 0,

                    RecentPayments = recentPayments.Data?.Select(p => new Entities.DTOs.PaymentWithUserDto
                    {
                        Id = p.Id,
                        PaymentType = p.PaymentType,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,
                        DueDate = p.DueDate,
                        BuildingId = p.BuildingId,
                        ApartmentId = p.ApartmentId,
                        UserId = p.UserId,
                        IsPaid = p.IsPaid,
                        UserFullName = p.UserFullName ?? string.Empty,
                        ProfileImageUrl = p.ProfileImageUrl ?? string.Empty,
                        DelayedDays = p.DelayedDays,
                        DelayPenaltyAmount = p.DelayPenaltyAmount,
                        TotalAmount = p.TotalAmount ?? p.Amount,
                        Description = p.PaymentType.ToLower() switch
                        {
                            "rent" or "dues" => p.IsPaid
                                ? (p.DelayedDays > 0
                                    ? $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2} (Gecikme: {p.DelayedDays} gün, Gecikme Bedeli: {p.DelayPenaltyAmount:C2}, Toplam: {p.TotalAmount:C2})"
                                    : $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2}")
                                : $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2} (Bekliyor)",
                            _ => $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2}"
                        }
                    }).ToList() ?? new List<Entities.DTOs.PaymentWithUserDto>(),

                    RecentComplaints = recentComplaints.Data?.Select(c => new ComplaintWithUserDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        BuildingId = c.BuildingId,
                        UserId = c.UserId,
                        Status = c.Status,
                        CreatedByName = c.CreatedByName ?? string.Empty,
                        ProfileImageUrl = c.ProfileImageUrl ?? string.Empty
                    }).ToList() ?? new List<ComplaintWithUserDto>(),

                    MostComplainedBuilding = building != null ? new MostComplainedBuildingDto
                    {
                        BuildingId = building.Id,
                        BuildingName = building.BuildingName,
                        ComplaintCount = complaintCount,
                        CommonComplaints = commonComplaintsResult.Data ?? new List<string>(),
                        LastComplaintDate = recentComplaints.Data?
                            .Where(c => c.BuildingId == building.Id)
                            .Max(c => c.CreatedAt) ?? DateTime.MinValue
                    } : new MostComplainedBuildingDto(),

                    Summary = new DashboardSummaryDto
                    {
                        TotalBuildings = buildings.Data?.Count ?? 0,
                        TotalTenants = totalTenants.Success ? totalTenants.Data : 0,
                        TotalComplaints = recentComplaints.Data?.Count ?? 0,
                        PendingPayments = recentPayments.Data?.Count(p => !p.IsPaid) ?? 0,
                        UpcomingMeetings = 0 // You might want to add this data from a service
                    },

                    FinancialOverview = new FinancialOverviewDto
                    {
                        MonthlyTotalIncome = monthlyIncome.Success ? monthlyIncome.Data : 0,
                        MonthlyExpectedIncome = buildings.Data?.Sum(b => b.TotalDuesAmount + b.TotalRentAmount) ?? 0,
                        MonthlyCollectedAmount = recentPayments.Data?.Where(p => p.IsPaid).Sum(p => p.Amount) ?? 0,
                        CollectionRate = Math.Min(CalculateCollectionRate(
                            recentPayments.Data?.Where(p => p.IsPaid).Sum(p => p.Amount) ?? 0,
                            buildings.Data?.Sum(b => b.TotalDuesAmount + b.TotalRentAmount) ?? 0
                        ), 100),
                        MonthlyDuesAmount = buildings.Data?.Sum(b => b.TotalDuesAmount) ?? 0,
                        MonthlyRentAmount = buildings.Data?.Sum(b => b.TotalRentAmount) ?? 0,
                        CollectedDuesAmount = recentPayments.Data?.Where(p => p.IsPaid && p.PaymentType == "Dues").Sum(p => p.Amount) ?? 0,
                        CollectedRentAmount = recentPayments.Data?.Where(p => p.IsPaid && p.PaymentType == "Rent").Sum(p => p.Amount) ?? 0
                    },

                    RecentActivities = recentPayments.Data?.Select(p => new DashboardActivityDto
                    {
                        Id = p.Id,
                        ActivityType = "Payment",
                        Title = p.PaymentType,
                        Description = $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2} {p.PaymentType}" +
                                    (p.DelayedDays > 0 ? $" (Gecikme: {p.DelayedDays} gün, Gecikme Bedeli: {p.DelayPenaltyAmount:C2}, Toplam: {p.TotalAmount:C2})" : ""),
                        ActivityDate = p.PaymentDate,
                        RelatedEntity = $"Daire {p.ApartmentId}",
                        Status = p.IsPaid ? "Ödendi" : "Bekliyor",
                        Amount = p.TotalAmount,
                        UserFullName = p.UserFullName ?? string.Empty,
                        ProfileImageUrl = p.ProfileImageUrl ?? string.Empty
                    })
                    .Concat(recentComplaints.Data?.Select(c => new DashboardActivityDto
                    {
                        Id = c.Id,
                        ActivityType = "Complaint",
                        Title = c.Subject,
                        Description = c.Description ?? string.Empty,
                        ActivityDate = c.CreatedAt,
                        RelatedEntity = $"Daire {c.UserId}",
                        Status = c.Status switch
                        {
                            (int)ComplaintStatus.Open => "Açık",
                            (int)ComplaintStatus.InProgress => "İşlemde",
                            (int)ComplaintStatus.Resolved => "Çözüldü",
                            (int)ComplaintStatus.Rejected => "Reddedildi",
                            _ => "Bekliyor"
                        },
                        UserFullName = c.CreatedByName ?? string.Empty,
                        ProfileImageUrl = c.ProfileImageUrl ?? string.Empty
                    }) ?? Enumerable.Empty<DashboardActivityDto>())
                    .OrderByDescending(a => a.ActivityDate)
                    .Take(10)
                    .ToList() ?? new List<DashboardActivityDto>(),

                    Pagination = new PaginationMetadata
                    {
                        CurrentPage = 1,
                        PageSize = 10,
                        TotalCount = (recentPayments.Data?.Count ?? 0) + (recentComplaints.Data?.Count ?? 0),
                        TotalPages = CalculateTotalPages((recentPayments.Data?.Count ?? 0) + (recentComplaints.Data?.Count ?? 0), 10)
                    }
                };

                return Ok(ApiResponse<EnhancedDashboardDto>.SuccessResult(
                    "Dashboard bilgileri başarıyla getirildi",
                    dashboard));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting enhanced dashboard: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("dashboard/{adminId}/activities")]
        public async Task<IActionResult> GetDashboardActivities(
            int adminId,
            [FromQuery] DashboardFilterDto filter)
        {
            try
            {
                filter ??= new DashboardFilterDto();
                var activitiesResult = await _adminService.GetFilteredActivitiesAsync(adminId, filter);

                if (!activitiesResult.Success || activitiesResult.Data == null)
                {
                    return BadRequest(activitiesResult);
                }

                return Ok(ApiResponse<List<DashboardActivityDto>>.SuccessResult(
                    "Aktiviteler başarıyla getirildi",
                    activitiesResult.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dashboard activities: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("dashboard/{adminId}/financial-overview")]
        public async Task<IActionResult> GetFinancialOverview(
            int adminId,
            [FromQuery] DashboardFilterDto filter)
        {
            try
            {
                filter ??= new DashboardFilterDto();
                var financialResult = await _adminService.GetFinancialOverviewAsync(adminId, filter);

                if (!financialResult.Success || financialResult.Data == null)
                {
                    return BadRequest(financialResult);
                }

                return Ok(ApiResponse<FinancialOverviewDto>.SuccessResult(
                    "Finansal özet başarıyla getirildi",
                    financialResult.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting financial overview: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("dashboard/{adminId}/summary")]
        public async Task<IActionResult> GetDashboardSummary(int adminId)
        {
            try
            {
                var summaryResult = await _adminService.GetDashboardSummaryAsync(adminId);

                if (!summaryResult.Success || summaryResult.Data == null || summaryResult.Data == null)
                {
                    return BadRequest(summaryResult);
                }

                return Ok(ApiResponse<DashboardSummaryDto>.SuccessResult(
                    "Dashboard özeti başarıyla getirildi",
                    summaryResult.Data));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dashboard summary: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        /// <summary>
        /// Yönetim ekranı verilerini getirir
        /// </summary>
        /// <param name="adminId">Yönetici ID</param>
        /// <param name="buildingId">Bina ID (opsiyonel)</param>
        /// <returns>Yönetim ekranı verileri</returns>
        [HttpGet("management/{adminId}")]
        public async Task<IActionResult> GetManagementDashboard(
            int adminId,
            [FromQuery] int? buildingId)
        {
            try
            {
                _logger.LogInformation("Getting management dashboard for admin {AdminId}", adminId);

                var filter = new ManagementFilterDto { BuildingId = buildingId };
                var result = await _adminService.GetManagementDashboardAsync(adminId, filter);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting management dashboard for admin {AdminId}", adminId);
                return StatusCode(500, ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }

        private static decimal CalculateCollectionRate(decimal collected, decimal expected)
        {
            return expected > 0 ? (collected / expected) * 100 : 0;
        }

        private static int CalculateTotalPages(int totalItems, int pageSize)
        {
            return (int)Math.Ceiling(totalItems / (double)pageSize);
        }

        [HttpGet("payments")]
        public IActionResult GetPayments()
        {
            var payments = _paymentService.GetAll()
                .Select(p => new Entities.DTOs.PaymentWithUserDto
                {
                    Id = p.Id,
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    DueDate = p.DueDate,
                    BuildingId = p.BuildingId,
                    ApartmentId = p.ApartmentId,
                    UserId = p.UserId,
                    IsPaid = p.IsPaid,
                    UserFullName = p.UserFullName,
                    DelayedDays = p.DelayedDays,
                    DelayPenaltyAmount = p.DelayPenaltyAmount,
                    TotalAmount = p.TotalAmount,
                    Description = p.Description
                })
                .ToList();

            return Ok(payments);
        }

        [HttpGet("buildings/{buildingId}/recent-activities")]
        public async Task<IActionResult> GetBuildingRecentActivities(int buildingId, [FromQuery] int count = 10)
        {
            try
            {
                var recentActivities = new List<BuildingActivityDto>();

                // Son ödemeleri getir
                var recentPayments = await _adminService.GetLastPaymentsByBuildingAsync(buildingId, count);
                if (recentPayments.Success && recentPayments.Data != null)
                {
                    recentActivities.AddRange(recentPayments.Data.Select(p => new BuildingActivityDto
                    {
                        Id = p.Id,
                        ActivityType = "Payment",
                        Title = p.PaymentType,
                        Description = $"{p.UserFullName} - Daire {p.ApartmentId} - {p.Amount:C2} {p.PaymentType}" +
                                    (p.DelayedDays > 0 ? $" (Gecikme: {p.DelayedDays} gün, Gecikme Bedeli: {p.DelayPenaltyAmount:C2}, Toplam: {p.TotalAmount:C2})" : ""),
                        ActivityDate = p.PaymentDate,
                        RelatedEntity = $"Daire {p.ApartmentId}",
                        Status = p.IsPaid ? "Ödendi" : "Bekliyor",
                        Amount = p.TotalAmount,
                        UserFullName = p.UserFullName ?? string.Empty,
                        ProfileImageUrl = p.ProfileImageUrl ?? string.Empty
                    }));
                }

                // Son şikayetleri getir
                var recentComplaints = await _adminService.GetLastComplaintsByBuildingAsync(buildingId, count);
                if (recentComplaints.Success && recentComplaints.Data != null)
                {
                    recentActivities.AddRange(recentComplaints.Data.Select(c => new BuildingActivityDto
                    {
                        Id = c.Id,
                        ActivityType = "Complaint",
                        Title = c.Subject,
                        Description = c.Description ?? string.Empty,
                        ActivityDate = c.CreatedAt,
                        RelatedEntity = $"Daire {c.UserId}",
                        Status = c.Status switch
                        {
                            (int)ComplaintStatus.Open => "Açık",
                            (int)ComplaintStatus.InProgress => "İşlemde",
                            (int)ComplaintStatus.Resolved => "Çözüldü",
                            (int)ComplaintStatus.Rejected => "Reddedildi",
                            _ => "Bekliyor"
                        },
                        UserFullName = c.CreatedByName ?? string.Empty,
                        ProfileImageUrl = c.ProfileImageUrl ?? string.Empty
                    }));
                }

                // Son anketleri getir
                var recentSurveys = await _adminService.GetLastSurveysByBuildingAsync(buildingId, count);
                if (recentSurveys.Success && recentSurveys.Data != null)
                {
                    recentActivities.AddRange(recentSurveys.Data.Select(s => new BuildingActivityDto
                    {
                        Id = s.Id,
                        ActivityType = "Survey",
                        Title = s.Title,
                        Description = s.Description ?? string.Empty,
                        ActivityDate = s.CreatedDate,
                        RelatedEntity = "Bina Geneli",
                        Status = s.Status switch
                        {
                            (int)SurveyStatus.Active => "Aktif",
                            (int)SurveyStatus.Completed => "Tamamlandı",
                            (int)SurveyStatus.Cancelled => "İptal Edildi",
                            _ => "Bekliyor"
                        },
                        UserFullName = s.CreatedByName ?? string.Empty,
                        ProfileImageUrl = s.ProfileImageUrl ?? string.Empty
                    }));
                }

                // Son toplantıları getir
                var recentMeetings = await _adminService.GetLastMeetingsByBuildingAsync(buildingId, count);
                if (recentMeetings.Success && recentMeetings.Data != null)
                {
                    recentActivities.AddRange(recentMeetings.Data.Select(m => new BuildingActivityDto
                    {
                        Id = m.Id,
                        ActivityType = "Meeting",
                        Title = m.Title,
                        Description = m.Description ?? string.Empty,
                        ActivityDate = m.MeetingDate,
                        RelatedEntity = m.Location ?? "Bina Geneli",
                        Status = m.Status switch
                        {
                            (int)MeetingStatus.Scheduled => "Planlandı",
                            (int)MeetingStatus.InProgress => "Devam Ediyor",
                            (int)MeetingStatus.Completed => "Tamamlandı",
                            (int)MeetingStatus.Cancelled => "İptal Edildi",
                            _ => "Bekliyor"
                        },
                        UserFullName = m.OrganizedByName ?? string.Empty,
                        ProfileImageUrl = m.OrganizerImageUrl ?? string.Empty
                    }));
                }

                // Tüm aktiviteleri tarihe göre sırala ve istenen sayıda döndür
                var sortedActivities = recentActivities
                    .OrderByDescending(a => a.ActivityDate)
                    .Take(count)
                    .ToList();

                return Ok(ApiResponse<List<BuildingActivityDto>>.SuccessResult(
                    "Bina aktiviteleri başarıyla getirildi",
                    sortedActivities));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building activities: {ex.Message}");
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}
