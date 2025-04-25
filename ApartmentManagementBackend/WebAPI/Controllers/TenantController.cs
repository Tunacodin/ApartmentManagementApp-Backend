using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.DTOs;
using Microsoft.Extensions.Logging;
using FluentValidation;
using Core.Utilities.Results;
using Core.Constants;
using Entities.Concrete;
using Entities.DTOs.Complaint;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly ITenantService _tenantService;
        private readonly ILogger<TenantController> _logger;
        private readonly IValidator<TenantDto> _validator;

        public TenantController(ITenantService tenantService, ILogger<TenantController> logger, IValidator<TenantDto> validator)
        {
            _tenantService = tenantService;
            _logger = logger;
            _validator = validator;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var tenants = _tenantService.GetAllTenants();
            if (tenants == null || !tenants.Any())
            {
                return NotFound(ApiResponse<List<TenantListDto>>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<List<TenantListDto>>.SuccessResult(Messages.TenantsRetrieved, tenants));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var tenant = _tenantService.GetTenantById(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<TenantDetailDto>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<TenantDetailDto>.SuccessResult(Messages.TenantRetrieved, tenant));
        }

        [HttpGet("{id}/payments")]
        public IActionResult GetTenantPayments(int id)
        {
            var payments = _tenantService.GetTenantPayments(id);
            if (payments == null)
            {
                return NotFound(ApiResponse<List<PaymentHistoryDto>>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<List<PaymentHistoryDto>>.SuccessResult(Messages.PaymentsListed, payments));
        }

        [HttpGet("{id}/with-payments")]
        public IActionResult GetTenantWithPayments(int id)
        {
            var tenant = _tenantService.GetTenantWithPayments(id);
            if (tenant == null)
            {
                return NotFound(ApiResponse<TenantWithPaymentsDto>.ErrorResult(Messages.TenantNotFound));
            }
            return Ok(ApiResponse<TenantWithPaymentsDto>.SuccessResult(Messages.TenantRetrieved, tenant));
        }

        [HttpPost]
        public IActionResult Add([FromBody] TenantDto tenantDto)
        {
            var validationResult = _validator.Validate(tenantDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<List<string>>.ErrorResult(Messages.ValidationFailed));
            }

            _tenantService.AddFromDto(tenantDto);
            return CreatedAtAction(nameof(GetById), new { id = tenantDto.Id },
                ApiResponse<TenantDto>.SuccessResult(Messages.TenantAdded, tenantDto));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] TenantDto tenantDto)
        {
            if (tenantDto.Id != id)
            {
                return BadRequest(ApiResponse<string>.ErrorResult(Messages.TenantIdMismatch));
            }

            var validationResult = _validator.Validate(tenantDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<List<string>>.ErrorResult(Messages.ValidationFailed));
            }

            _tenantService.UpdateFromDto(tenantDto);
            return Ok(ApiResponse<TenantDto>.SuccessResult(Messages.TenantUpdated, tenantDto));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _tenantService.Delete(id);
            return Ok(ApiResponse<bool>.SuccessResult(Messages.TenantDeleted, true));
        }

        [HttpGet("{id}/dashboard")]
        public IActionResult GetDashboard(int id)
        {
            try
            {
                // Kiracı ID'sinin geçerli olup olmadığını kontrol et
                if (id <= 0)
                {
                    return BadRequest(ApiResponse<TenantDashboardDto>.ErrorResult(Messages.InvalidTenantId));
                }

                // Development için yetki kontrolünü devre dışı bırak
                // var tenantId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
                // if (tenantId != id)
                // {
                //     return Unauthorized(ApiResponse<TenantDashboardDto>.ErrorResult(Messages.UnauthorizedAccess));
                // }

                // Dashboard verilerini getir
                var dashboard = _tenantService.GetTenantDashboard(id);

                // Verilerin boş olup olmadığını kontrol et
                if (dashboard == null)
                {
                    return NotFound(ApiResponse<TenantDashboardDto>.ErrorResult(Messages.TenantNotFound));
                }

                // Log detailed building information
                _logger.LogInformation($"Dashboard Building Info - Profile BuildingId: {dashboard.Profile.BuildingId}, " +
                    $"Building Object Id: {dashboard.Building?.Id}, " +
                    $"Apartment BuildingId: {dashboard.Apartment?.Id}");

                // Ensure BuildingId is set in the response
                if (dashboard.Building != null)
                {
                    dashboard.Profile.BuildingId = dashboard.Building.Id;
                    dashboard.Profile.BuildingName = dashboard.Building.BuildingName;
                    dashboard.Profile.BuildingAddress = $"{dashboard.Building.Street} {dashboard.Building.BuildingNumber}, {dashboard.Building.Neighborhood}, {dashboard.Building.District}, {dashboard.Building.City}";

                    _logger.LogInformation($"Building ID set in profile - New BuildingId: {dashboard.Profile.BuildingId}");
                }

                // Başarılı yanıt döndür
                return Ok(ApiResponse<TenantDashboardDto>.SuccessResult(Messages.DashboardRetrieved, dashboard));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError(ex, "Tenant dashboard data not found for ID: {TenantId}", id);
                return NotFound(ApiResponse<TenantDashboardDto>.ErrorResult(Messages.TenantNotFound));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard for tenant ID: {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantDashboardDto>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{id}/notifications")]
        public IActionResult GetNotifications(int id)
        {
            try
            {
                var notifications = _tenantService.GetTenantNotifications(id);
                return Ok(ApiResponse<List<NotificationDto>>.SuccessResult(Messages.NotificationsListed, notifications));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<List<NotificationDto>>.ErrorResult(Messages.TenantNotFound));
            }
        }

        [HttpGet("{id}/meetings")]
        public IActionResult GetUpcomingMeetings(int id)
        {
            try
            {
                var meetings = _tenantService.GetUpcomingMeetings(id);
                return Ok(ApiResponse<List<MeetingDto>>.SuccessResult(Messages.MeetingsListed, meetings));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<List<MeetingDto>>.ErrorResult(Messages.TenantNotFound));
            }
        }

        [HttpGet("{id}/surveys")]
        public IActionResult GetActiveSurveys(int id)
        {
            try
            {
                var surveys = _tenantService.GetActiveSurveys(id);
                return Ok(ApiResponse<List<SurveyDto>>.SuccessResult(Messages.SurveysListed, surveys));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<List<SurveyDto>>.ErrorResult(Messages.TenantNotFound));
            }
        }

        [HttpGet("{id}/complaints")]
        public IActionResult GetRecentComplaints(int id)
        {
            try
            {
                var complaints = _tenantService.GetRecentComplaints(id);
                return Ok(ApiResponse<List<ComplaintDto>>.SuccessResult(Messages.ComplaintsListed, complaints));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<List<ComplaintDto>>.ErrorResult(Messages.TenantNotFound));
            }
        }

        [HttpPost("complaints")]
        public IActionResult CreateComplaint([FromBody] CreateComplaintRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int tenantId))
                {
                    return Unauthorized(ApiResponse<object>.ErrorResult(Messages.UserNotFound));
                }

                _tenantService.CreateComplaint(tenantId, request.Title, request.Description);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.ComplaintCreated, true));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating complaint");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost("{id}/surveys/{surveyId}/responses")]
        public IActionResult SubmitSurveyResponse(int id, int surveyId, [FromBody] Dictionary<int, string> responses)
        {
            try
            {
                _tenantService.SubmitSurveyResponse(id, surveyId, responses);
                return Ok(ApiResponse<bool>.SuccessResult(Messages.SurveyResponseSubmitted, true));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<bool>.ErrorResult(Messages.TenantNotFound));
            }
        }

        [HttpGet("{id}/activities")]
        public IActionResult GetTenantActivities(int id)
        {
            try
            {
                var activities = new TenantActivitiesDto();

                // Ödemeler
                var payments = _tenantService.GetTenantPayments(id);
                activities.PaymentHistory = payments.Select(p => new PaymentWithUserDto
                {
                    Id = p.Id,
                    PaymentType = p.PaymentType,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    IsPaid = p.IsPaid,
                    UserFullName = p.UserFullName,
                    ProfileImageUrl = p.ProfileImageUrl
                }).ToList();

                // Toplantılar
                var meetings = _tenantService.GetUpcomingMeetings(id);
                activities.MeetingHistory = meetings.Select(m => new MeetingDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    MeetingDate = m.MeetingDate,
                    BuildingId = m.BuildingId,
                    OrganizedById = m.OrganizedById
                }).ToList();

                // Anketler
                var surveys = _tenantService.GetActiveSurveys(id);
                activities.SurveyHistory = surveys.Select(s => new SurveyDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive,
                    BuildingId = s.BuildingId,
                    TotalResponses = s.TotalResponses
                }).ToList();

                // Şikayetler
                var complaints = _tenantService.GetRecentComplaints(id);
                activities.ComplaintHistory = complaints.Select(c => new ComplaintDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    CreatedDate = c.CreatedDate,
                    Status = c.Status == "Resolved" ? "1" : "0",
                    BuildingId = c.BuildingId,
                    ApartmentId = c.ApartmentId,
                    TenantId = c.TenantId,
                    Response = c.Response,
                    ResponseDate = c.ResponseDate,
                    RespondedByAdminId = c.RespondedByAdminId,
                    IsResolved = c.IsResolved,
                    IsInProgress = c.IsInProgress,
                    ResolvedByAdminId = c.ResolvedByAdminId,
                    ResolvedAt = c.ResolvedAt,
                    CreatedByName = c.CreatedByName
                }).ToList();

                return Ok(ApiResponse<TenantActivitiesDto>.SuccessResult(Messages.ActivitiesListed, activities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting activities for tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantActivitiesDto>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{id}/profile")]
        public IActionResult GetProfile(int id)
        {
            try
            {
                // Kiracı ID'sinin geçerli olup olmadığını kontrol et
                if (id <= 0)
                {
                    return BadRequest(ApiResponse<TenantProfileDto>.ErrorResult(Messages.InvalidTenantId));
                }

                // Development için yetki kontrolünü devre dışı bırak
                // var tenantId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
                // if (tenantId != id)
                // {
                //     return Unauthorized(ApiResponse<TenantProfileDto>.ErrorResult(Messages.UnauthorizedAccess));
                // }

                // Temel kiracı bilgilerini getir
                var tenant = _tenantService.GetTenantById(id);
                if (tenant == null)
                {
                    return NotFound(ApiResponse<TenantProfileDto>.ErrorResult(Messages.TenantNotFound));
                }

                // Profil DTO'sunu oluştur
                var profile = new TenantProfileDto
                {
                    // Temel Bilgiler
                    Id = tenant.Id,
                    FullName = tenant.FullName,
                    Email = tenant.Email,
                    PhoneNumber = tenant.PhoneNumber,
                    ProfileImageUrl = tenant.ProfileImageUrl,
                    IsActive = tenant.IsActive,

                    // Daire ve Bina Bilgileri
                    ApartmentId = tenant.ApartmentId,
                    ApartmentNumber = tenant.ApartmentNumber.ToString(),
                    BuildingId = tenant.BuildingId,
                    BuildingName = tenant.BuildingName,

                    // Kontrat Bilgileri
                    LeaseStartDate = tenant.LeaseStartDate,
                    LeaseEndDate = tenant.LeaseEndDate ?? DateTime.MaxValue,
                    MonthlyRent = tenant.MonthlyRent,
                    MonthlyDues = tenant.MonthlyDues,

                    // İstatistikler
                    TotalPayments = _tenantService.GetTenantPayments(id).Count,
                    PendingPayments = _tenantService.GetTenantPayments(id).Count(p => !p.IsPaid),
                    TotalComplaints = _tenantService.GetRecentComplaints(id).Count,
                    ActiveComplaints = _tenantService.GetRecentComplaints(id).Count(c => !c.IsResolved),
                    TotalMeetings = _tenantService.GetUpcomingMeetings(id).Count,
                    UpcomingMeetings = _tenantService.GetUpcomingMeetings(id).Count(m => m.MeetingDate > DateTime.Now),

                    // Son Aktiviteler
                    RecentPayments = _tenantService.GetTenantPayments(id)?
                        .Select(p => new PaymentWithUserDto
                        {
                            Id = p.Id,
                            PaymentType = p.PaymentType,
                            Amount = p.Amount,
                            PaymentDate = p.PaymentDate,
                            IsPaid = p.IsPaid,
                            UserFullName = p.UserFullName,
                            ProfileImageUrl = p.ProfileImageUrl
                        })
                        .OrderByDescending(p => p.PaymentDate)
                        .Take(5)
                        .ToList() ?? new List<PaymentWithUserDto>(),

                    RecentComplaints = _tenantService.GetRecentComplaints(id)?
                        .Select(c => new ComplaintWithUserDto
                        {
                            Id = c.Id,
                            Subject = c.Title,
                            Description = c.Description,
                            CreatedAt = c.CreatedDate,
                            Status = c.Status == "Resolved" ? 1 : 0,
                            CreatedByName = c.CreatedByName
                        })
                        .OrderByDescending(c => c.CreatedAt)
                        .Take(5)
                        .ToList() ?? new List<ComplaintWithUserDto>(),

                    UpcomingMeetingsList = _tenantService.GetUpcomingMeetings(id)
                        .Where(m => m.MeetingDate > DateTime.Now)
                        .OrderBy(m => m.MeetingDate)
                        .Take(5)
                        .ToList(),

                    // Yönetici Bilgileri
                    AdminName = tenant.AdminName,
                    AdminPhone = tenant.AdminPhone,
                    AdminEmail = tenant.AdminEmail,

                    // Ev Sahibi Bilgileri
                    OwnerName = tenant.OwnerName,
                    OwnerPhone = tenant.OwnerPhone,
                    OwnerEmail = tenant.OwnerEmail
                };

                return Ok(ApiResponse<TenantProfileDto>.SuccessResult(Messages.ProfileRetrieved, profile));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile for tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantProfileDto>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}
