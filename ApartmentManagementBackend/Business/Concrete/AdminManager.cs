using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Core.Utilities.Results;
using Core.Constants;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class AdminManager : IAdminService
    {
        private readonly IUserDal _userDal;
        private readonly IBuildingDal _buildingDal;
        private readonly ITenantDal _tenantDal;
        private readonly IApartmentDal _apartmentDal;
        private readonly INotificationDal _notificationDal;
        private readonly IMeetingDal _meetingDal;
        private readonly IAdminDal _adminDal;
        private readonly IContractDal _contractDal;
        private readonly ILogger<AdminManager> _logger;

        public AdminManager(
            IUserDal userDal,
            IBuildingDal buildingDal,
            ITenantDal tenantDal,
            IApartmentDal apartmentDal,
            INotificationDal notificationDal,
            IMeetingDal meetingDal,
            IAdminDal adminDal,
            IContractDal contractDal,
            ILogger<AdminManager> logger)
        {
            _userDal = userDal;
            _buildingDal = buildingDal;
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
            _notificationDal = notificationDal;
            _meetingDal = meetingDal;
            _adminDal = adminDal;
            _contractDal = contractDal;
            _logger = logger;
        }

        public async Task<ApiResponse<AdminDetailDto>> GetByIdAsync(int id)
        {
            return await Task.Run(() =>
            {
                var admin = _adminDal.Get(a => a.Id == id);
                if (admin == null)
                    return ApiResponse<AdminDetailDto>.ErrorResult(Messages.AdminNotFound);

                var detailDto = new AdminDetailDto
                {
                    Id = admin.Id,
                    FullName = $"{admin.FirstName ?? ""} {admin.LastName ?? ""}".Trim(),
                    Email = admin.Email ?? "",
                    PhoneNumber = admin.PhoneNumber ?? "",
                    IsActive = admin.IsActive,
                    ProfileImageUrl = admin.ProfileImageUrl ?? "",
                    Description = admin.Description ?? "",
                    CreatedAt = admin.CreatedAt,
                    LastLoginDate = admin.LastLoginDate
                };

                return ApiResponse<AdminDetailDto>.SuccessResult(Messages.AdminRetrieved, detailDto);
            });
        }

        public async Task<ApiResponse<AdminDto>> UpdateAsync(AdminDto adminDto)
        {
            return await Task.Run(() =>
            {
                var admin = _userDal.Get(a => a.Id == adminDto.Id && a.Role == "admin");
                if (admin == null)
                    return ApiResponse<AdminDto>.ErrorResult(Messages.AdminNotFound);

                admin.FirstName = adminDto.FullName.Split(' ')[0];
                admin.LastName = string.Join(" ", adminDto.FullName.Split(' ').Skip(1));
                admin.Email = adminDto.Email;
                admin.PhoneNumber = adminDto.PhoneNumber;
                admin.IsActive = adminDto.IsActive;
                admin.ProfileImageUrl = adminDto.ProfileImageUrl;
                admin.Description = adminDto.Description;

                _userDal.Update(admin);
                return ApiResponse<AdminDto>.SuccessResult(Messages.AdminUpdated, adminDto);
            });
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            return await Task.Run(() =>
            {
                var admin = _userDal.Get(a => a.Id == id && a.Role == "admin");
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                _userDal.Delete(admin);
                return ApiResponse<bool>.SuccessResult(Messages.AdminDeleted, true);
            });
        }

        public async Task<ApiResponse<List<AdminListDto>>> GetAllAsync()
        {
            return await Task.Run(() =>
            {
                var admins = _userDal.GetAll(u => u.Role == "admin") ?? new List<User>();
                var adminDtos = admins.Select(a => new AdminListDto
                {
                    Id = a.Id,
                    FullName = $"{a.FirstName ?? ""} {a.LastName ?? ""}".Trim(),
                    Email = a.Email ?? "",
                    PhoneNumber = a.PhoneNumber ?? "",
                    IsActive = a.IsActive
                }).ToList();

                return ApiResponse<List<AdminListDto>>.SuccessResult(Messages.AdminsListed, adminDtos);
            });
        }

        public async Task<ApiResponse<AdminDashboardDto>> GetDashboardAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<AdminDashboardDto>.ErrorResult(Messages.AdminNotFound);

                var managedBuildings = await _adminDal.GetManagedBuildings(adminId);
                var totalResidents = await _adminDal.GetTotalResidentsCount(adminId);
                var monthlyIncome = await _adminDal.GetTotalMonthlyIncome(adminId);
                var activeComplaints = await _adminDal.GetActiveComplaints(adminId);
                var upcomingMeetings = await _adminDal.GetUpcomingMeetings(adminId);
                var recentPayments = await _adminDal.GetRecentPayments(adminId);

                // Önce tüm bina apartman sayılarını al
                var buildingApartmentCounts = new Dictionary<int, int>();
                foreach (var building in managedBuildings)
                {
                    buildingApartmentCounts[building.Id] = await _adminDal.GetBuildingApartmentCount(building.Id);
                }

                var dashboard = new AdminDashboardDto
                {
                    TotalBuildings = managedBuildings.Count,
                    TotalApartments = buildingApartmentCounts.Values.Sum(),
                    TotalResidents = totalResidents,
                    TotalMonthlyIncome = monthlyIncome,
                    PendingComplaints = activeComplaints.Count,
                    UpcomingMeetings = upcomingMeetings.Count,
                    RecentActivities = activeComplaints.Select(c => new RecentActivityDto
                    {
                        Id = c.Id,
                        ActivityType = "Complaint",
                        Description = c.Description ?? string.Empty,
                        ActivityDate = c.CreatedAt,
                        RelatedUserName = c.CreatedByName ?? string.Empty,
                        Status = c.Status == 1 ? "Resolved" : "Pending"
                    }).ToList(),
                    FinancialSummaries = managedBuildings.Select(async b =>
                    {
                        var buildingTenants = await _adminDal.GetBuildingTenants(b.Id);
                        var buildingPayments = recentPayments.Where(p => buildingTenants.Contains(p.UserId));
                        var expectedIncome = b.DuesAmount * buildingApartmentCounts[b.Id];
                        var collectedAmount = buildingPayments.Sum(p => p.Amount);

                        return new FinancialSummaryDto
                        {
                            BuildingName = b.BuildingName,
                            ExpectedIncome = expectedIncome,
                            CollectedAmount = collectedAmount,
                            PendingAmount = expectedIncome - collectedAmount,
                            CollectionRate = expectedIncome > 0 ? (collectedAmount / expectedIncome * 100) : 0,
                            TotalPayments = buildingPayments.Count(),
                            PendingPayments = buildingPayments.Count(p => !p.IsPaid)
                        };
                    }).Select(t => t.Result).ToList()
                };

                return ApiResponse<AdminDashboardDto>.SuccessResult(Messages.AdminDashboardRetrieved, dashboard);
            });
        }

        public async Task<ApiResponse<List<RecentActivityDto>>> GetRecentActivitiesAsync(int adminId, int count = 10)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<List<RecentActivityDto>>.ErrorResult(Messages.AdminNotFound);

                var complaints = await _adminDal.GetActiveComplaints(adminId);
                var payments = await _adminDal.GetRecentPayments(adminId);
                var meetings = await _adminDal.GetUpcomingMeetings(adminId);

                var activities = new List<RecentActivityDto>();

                // Şikayetlerden aktivite oluştur
                activities.AddRange(complaints.Select(c => new RecentActivityDto
                {
                    Id = c.Id,
                    ActivityType = "Complaint",
                    Description = c.Description ?? string.Empty,
                    ActivityDate = c.CreatedAt,
                    RelatedUserName = c.CreatedByName ?? string.Empty,
                    Status = c.Status == 1 ? "Resolved" : "Pending"
                }));

                // Ödemelerden aktivite oluştur
                activities.AddRange(payments.Select(p => new RecentActivityDto
                {
                    Id = p.Id,
                    ActivityType = "Payment",
                    Description = $"Payment of {p.Amount:C2}",
                    ActivityDate = p.PaymentDate,
                    RelatedUserName = p.UserFullName ?? string.Empty,
                    Status = p.IsPaid ? "Paid" : "Pending"
                }));

                // Toplantılardan aktivite oluştur
                activities.AddRange(meetings.Select(m => new RecentActivityDto
                {
                    Id = m.Id,
                    ActivityType = "Meeting",
                    Description = m.Description ?? string.Empty,
                    ActivityDate = m.MeetingDate,
                    RelatedUserName = m.OrganizedByName ?? string.Empty,
                    Status = m.MeetingDate > DateTime.Now ? "Upcoming" : "Completed"
                }));

                return ApiResponse<List<RecentActivityDto>>.SuccessResult(
                    Messages.AdminActivitiesListed,
                    activities.OrderByDescending(a => a.ActivityDate).Take(count).ToList()
                );
            });
        }

        public async Task<ApiResponse<List<FinancialSummaryDto>>> GetFinancialSummariesAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<List<FinancialSummaryDto>>.ErrorResult(Messages.AdminNotFound);

                var buildings = await _adminDal.GetManagedBuildings(adminId);
                var payments = await _adminDal.GetRecentPayments(adminId);

                var summaries = buildings.Select(async b =>
                {
                    var apartmentCount = await _adminDal.GetBuildingApartmentCount(b.Id);
                    var expectedIncome = b.DuesAmount * apartmentCount;
                    var buildingTenants = await _adminDal.GetBuildingTenants(b.Id);
                    var buildingPayments = payments.Where(p => buildingTenants.Contains(p.UserId));

                    return new FinancialSummaryDto
                    {
                        BuildingName = b.BuildingName,
                        ExpectedIncome = expectedIncome,
                        CollectedAmount = buildingPayments.Sum(p => p.Amount),
                        PendingAmount = expectedIncome - buildingPayments.Sum(p => p.Amount),
                        CollectionRate = buildingPayments.Sum(p => p.Amount) / expectedIncome * 100,
                        TotalPayments = buildingPayments.Count(),
                        PendingPayments = buildingPayments.Count(p => !p.IsPaid)
                    };
                }).Select(t => t.Result).ToList();

                return ApiResponse<List<FinancialSummaryDto>>.SuccessResult(
                    Messages.AdminFinancialSummaryRetrieved,
                    summaries
                );
            });
        }

        public async Task<ApiResponse<List<AdminManagedBuildingDto>>> GetManagedBuildingsAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<List<AdminManagedBuildingDto>>.ErrorResult(Messages.AdminNotFound);

                var buildings = await _adminDal.GetManagedBuildings(adminId);
                var managedBuildings = new List<AdminManagedBuildingDto>();
                var payments = await _adminDal.GetRecentPayments(adminId);

                foreach (var building in buildings)
                {
                    var totalApartments = await _adminDal.GetBuildingApartmentCount(building.Id);
                    var occupiedApartments = await _adminDal.GetOccupiedApartmentCount(building.Id);
                    var complaints = (await _adminDal.GetActiveComplaints(adminId))
                        .Count(c => c.BuildingId == building.Id);

                    var buildingTenants = await _adminDal.GetBuildingTenants(building.Id);
                    var buildingPayments = payments.Where(p => buildingTenants.Contains(p.UserId));

                    managedBuildings.Add(new AdminManagedBuildingDto
                    {
                        BuildingId = building.Id,
                        BuildingName = building.BuildingName,
                        TotalApartments = totalApartments,
                        OccupiedApartments = occupiedApartments,
                        OccupancyRate = totalApartments > 0 ? (decimal)occupiedApartments / totalApartments * 100 : 0,
                        TotalDuesAmount = building.DuesAmount * totalApartments,
                        ActiveComplaints = complaints,
                        LastMaintenanceDate = building.LastMaintenanceDate,
                        PendingAmount = (building.DuesAmount * totalApartments) - buildingPayments.Sum(p => p.Amount),
                        CollectionRate = buildingPayments.Sum(p => p.Amount) / (building.DuesAmount * totalApartments) * 100,
                        TotalPayments = buildingPayments.Count(),
                        PendingPayments = buildingPayments.Count(p => !p.IsPaid)
                    });
                }

                return ApiResponse<List<AdminManagedBuildingDto>>.SuccessResult(
                    Messages.AdminBuildingsListed,
                    managedBuildings
                );
            });
        }

        public async Task<ApiResponse<bool>> AssignBuildingAsync(int adminId, int buildingId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                var building = await _buildingDal.GetByIdAsync(buildingId);
                if (building == null)
                    return ApiResponse<bool>.ErrorResult(Messages.BuildingNotFound);

                building.AdminId = adminId;
                await _buildingDal.UpdateAsync(building);

                return ApiResponse<bool>.SuccessResult(Messages.BuildingAssigned, true);
            });
        }

        public async Task<ApiResponse<bool>> UnassignBuildingAsync(int adminId, int buildingId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                var building = await _buildingDal.GetByIdAsync(buildingId);
                if (building == null)
                    return ApiResponse<bool>.ErrorResult(Messages.BuildingNotFound);

                if (building.AdminId != adminId)
                    return ApiResponse<bool>.ErrorResult(Messages.BuildingNotFound);

                building.AdminId = 0; // veya null, yapınıza göre
                await _buildingDal.UpdateAsync(building);

                return ApiResponse<bool>.SuccessResult(Messages.BuildingUnassigned, true);
            });
        }

        public async Task<ApiResponse<int>> GetTotalResidentsAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<int>.ErrorResult(Messages.AdminNotFound);

                var count = await _adminDal.GetTotalResidentsCount(adminId);
                return ApiResponse<int>.SuccessResult(Messages.AdminStatisticsRetrieved, count);
            });
        }

        public async Task<ApiResponse<int>> GetActiveComplaintsCountAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<int>.ErrorResult(Messages.AdminNotFound);

                var complaints = await _adminDal.GetActiveComplaints(adminId);
                return ApiResponse<int>.SuccessResult(Messages.AdminStatisticsRetrieved, complaints.Count);
            });
        }

        public async Task<ApiResponse<int>> GetPendingPaymentsCountAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<int>.ErrorResult(Messages.AdminNotFound);

                var payments = await _adminDal.GetRecentPayments(adminId);
                var pendingCount = payments.Count(p => !p.IsPaid);
                return ApiResponse<int>.SuccessResult(Messages.AdminStatisticsRetrieved, pendingCount);
            });
        }

        public async Task<ApiResponse<int>> GetUpcomingMeetingsCountAsync(int adminId)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<int>.ErrorResult(Messages.AdminNotFound);

                var meetings = await _adminDal.GetUpcomingMeetings(adminId);
                return ApiResponse<int>.SuccessResult(Messages.AdminStatisticsRetrieved, meetings.Count);
            });
        }

        public async Task<ApiResponse<bool>> UpdateProfileAsync(int adminId, string? profileImageUrl, string? description)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                admin.ProfileImageUrl = profileImageUrl;
                admin.Description = description;
                admin.ProfileUpdatedAt = DateTime.Now;

                await _adminDal.UpdateAsync(admin);
                return ApiResponse<bool>.SuccessResult(Messages.ProfileUpdated, true);
            });
        }

        public async Task<ApiResponse<bool>> UpdatePasswordAsync(int adminId, string currentPassword, string newPassword)
        {
            return await Task.Run(async () =>
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                // Burada şifre doğrulama ve hash'leme işlemleri yapılmalı
                if (admin.Password != currentPassword) // Gerçek uygulamada hash'lenmiş şifreleri karşılaştırın
                    return ApiResponse<bool>.ErrorResult(Messages.InvalidCurrentPassword);

                admin.Password = newPassword; // Gerçek uygulamada yeni şifreyi hash'leyin
                await _adminDal.UpdateAsync(admin);

                return ApiResponse<bool>.SuccessResult(Messages.PasswordUpdated, true);
            });
        }

        public async Task<ApiResponse<bool>> UpdateContactInfoAsync(int adminId, string email, string phoneNumber)
        {
            return await Task.Run(() =>
            {
                var admin = _userDal.Get(a => a.Id == adminId && a.Role == "admin");
                if (admin == null)
                    return ApiResponse<bool>.ErrorResult(Messages.AdminNotFound);

                admin.Email = email;
                admin.PhoneNumber = phoneNumber;
                _userDal.Update(admin);
                return ApiResponse<bool>.SuccessResult(Messages.ContactInfoUpdated, true);
            });
        }

        public void DeleteTenant(int tenantId)
        {
            var tenant = _tenantDal.Get(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new KeyNotFoundException($"Tenant with ID {tenantId} not found.");
            }
            _tenantDal.Delete(tenant);
        }

        public void AssignOwnerToApartment(int ownerId, int apartmentId)
        {
            var apartment = _apartmentDal.Get(a => a.Id == apartmentId);
            if (apartment == null)
                throw new Exception("Apartment not found");

            var owner = _userDal.Get(u => u.Id == ownerId && u.Role == "owner");
            if (owner == null)
                throw new Exception("Owner not found");

            // Daire zaten başka bir ev sahibine atanmış mı kontrol et
            if (apartment.OwnerId != 0 && apartment.OwnerId != ownerId)
                throw new Exception("Apartment already assigned to another owner");

            apartment.OwnerId = ownerId;
            _apartmentDal.Update(apartment);

            // Bildirim oluştur
            var notification = new Notification
            {
                Title = "New Apartment Assignment",
                Message = $"You have been assigned as the owner of apartment {apartment.UnitNumber}",
                UserId = ownerId,
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1, // Current admin ID should be passed
                IsRead = false
            };
            _notificationDal.Add(notification);
        }

        public void AssignTenantToApartment(int tenantId, int apartmentId)
        {
            var apartment = _apartmentDal.Get(a => a.Id == apartmentId);
            if (apartment == null)
                throw new Exception("Apartment not found");

            var tenant = _userDal.Get(u => u.Id == tenantId && u.Role == "tenant");
            if (tenant == null)
                throw new Exception("Tenant not found");

            // Daire boş mu kontrol et
            if (apartment.Status != "available")
                throw new Exception("Apartment is not available for rent");

            apartment.Status = "rented";
            _apartmentDal.Update(apartment);

            // Kiracı-daire ilişkisini kaydet
            // Bu ilişki için ayrı bir tablo kullanılabilir

            // Bildirim oluştur
            var notification = new Notification
            {
                Title = "New Tenant Assignment",
                Message = $"A new tenant has been assigned to apartment {apartment.UnitNumber}",
                UserId = apartment.OwnerId, // Ev sahibine bildir
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1, // Current admin ID should be passed
                IsRead = false
            };
            _notificationDal.Add(notification);
        }

        public void ApproveTenantRequest(int requestId)
        {
            // Kiracı talebini onayla
            // Bu işlem için ayrı bir TenantRequest entity'si oluşturulabilir
        }

        public void RejectTenantRequest(int requestId, string reason)
        {
            // Kiracı talebini reddet
        }

        public void CreateNotification(Notification notification)
        {
            notification.CreatedAt = DateTime.Now;
            _notificationDal.Add(notification);
        }

        public void ScheduleMeeting(Meeting meeting)
        {
            meeting.CreatedAt = DateTime.Now;
            _meetingDal.Add(meeting);

            // Toplantı ile ilgili tüm kullanıcılara bildirim gönder
            var notification = new Notification
            {
                Title = "New Meeting Scheduled",
                Message = $"A new meeting has been scheduled for {meeting.MeetingDate}",
                CreatedAt = DateTime.Now,
                CreatedByAdminId = 1,
                IsRead = false
            };
            _notificationDal.Add(notification);
        }

        public async Task<ApiResponse<AdminDto>> AddAsync(AdminDto adminDto)
        {
            try
            {
                var admin = new Admin
                {
                    FirstName = adminDto.FullName.Split(' ')[0],
                    LastName = string.Join(" ", adminDto.FullName.Split(' ').Skip(1)),
                    Email = adminDto.Email,
                    PhoneNumber = adminDto.PhoneNumber,
                    Role = adminDto.Role,
                    IsActive = adminDto.IsActive,
                    ProfileImageUrl = adminDto.ProfileImageUrl,
                    Description = adminDto.Description,
                    Password = adminDto.Password,
                    CreatedAt = DateTime.Now
                };

                await _userDal.AddAsync(admin);
                adminDto.Id = admin.Id;

                return ApiResponse<AdminDto>.SuccessResult(Messages.AdminAdded, adminDto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding admin: {ex.Message}");
                return ApiResponse<AdminDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<EnhancedDashboardDto>> GetEnhancedDashboardAsync(int adminId, DashboardFilterDto filter)
        {
            try
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<EnhancedDashboardDto>.ErrorResult(Messages.AdminNotFound);

                // Özet bilgileri al
                var summary = await GetDashboardSummaryAsync(adminId);
                if (!summary.Success)
                    return ApiResponse<EnhancedDashboardDto>.ErrorResult(summary.Message);

                // Finansal genel bakış bilgilerini al
                var financialOverview = await GetFinancialOverviewAsync(adminId, filter);
                if (!financialOverview.Success)
                    return ApiResponse<EnhancedDashboardDto>.ErrorResult(financialOverview.Message);

                // Aktiviteleri al
                var activities = await GetFilteredActivitiesAsync(adminId, filter);
                if (!activities.Success)
                    return ApiResponse<EnhancedDashboardDto>.ErrorResult(activities.Message);

                // Sayfalama bilgilerini hesapla
                var totalItems = activities.Data?.Count ?? 0;
                var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);
                var paginatedActivities = activities.Data?
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList() ?? new List<DashboardActivityDto>();

                var dashboard = new EnhancedDashboardDto
                {
                    Summary = summary.Data ?? new DashboardSummaryDto(),
                    FinancialOverview = financialOverview.Data ?? new FinancialOverviewDto(),
                    RecentActivities = paginatedActivities ?? new List<DashboardActivityDto>(),
                    Pagination = new PaginationMetadata
                    {
                        CurrentPage = filter.PageNumber,
                        PageSize = filter.PageSize,
                        TotalCount = totalItems,
                        TotalPages = totalPages
                    }
                };

                return ApiResponse<EnhancedDashboardDto>.SuccessResult(Messages.Success, dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting enhanced dashboard: {ex.Message}");
                return ApiResponse<EnhancedDashboardDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync(int adminId)
        {
            try
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<DashboardSummaryDto>.ErrorResult(Messages.AdminNotFound);

                var buildings = await _adminDal.GetManagedBuildings(adminId);
                var tenants = await _adminDal.GetTotalResidentsCount(adminId);
                var complaints = (await _adminDal.GetActiveComplaints(adminId)).Count;
                var payments = await _adminDal.GetRecentPayments(adminId);
                var meetings = (await _adminDal.GetUpcomingMeetings(adminId)).Count;

                var summary = new DashboardSummaryDto
                {
                    TotalBuildings = buildings.Count,
                    TotalTenants = tenants,
                    TotalComplaints = complaints,
                    PendingPayments = payments.Count(p => !p.IsPaid),
                    UpcomingMeetings = meetings
                };

                return ApiResponse<DashboardSummaryDto>.SuccessResult(Messages.Success, summary);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting dashboard summary: {ex.Message}");
                return ApiResponse<DashboardSummaryDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<FinancialOverviewDto>> GetFinancialOverviewAsync(int adminId, DashboardFilterDto filter)
        {
            try
            {
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<FinancialOverviewDto>.ErrorResult(Messages.AdminNotFound);

                var buildings = await _adminDal.GetManagedBuildings(adminId);
                var payments = await _adminDal.GetRecentPayments(adminId);

                // Filtre uygula
                payments = payments.Where(p =>
                    p.PaymentDate >= filter.StartDate &&
                    p.PaymentDate <= filter.EndDate).ToList();

                decimal totalExpected = 0;
                decimal totalCollected = 0;
                decimal totalPending = 0;

                foreach (var payment in payments)
                {
                    if (payment.IsPaid)
                    {
                        totalCollected += payment.Amount;
                    }
                    else
                    {
                        totalPending += payment.Amount;
                    }
                    totalExpected += payment.Amount;
                }

                var overview = new FinancialOverviewDto
                {
                    MonthlyExpectedIncome = totalExpected,
                    MonthlyCollectedAmount = totalCollected,
                    MonthlyTotalIncome = totalCollected,
                    CollectionRate = totalCollected > 0 ? (totalCollected / totalExpected * 100) : 0
                };

                return ApiResponse<FinancialOverviewDto>.SuccessResult(Messages.Success, overview);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting financial overview: {ex.Message}");
                return ApiResponse<FinancialOverviewDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<DashboardActivityDto>>> GetFilteredActivitiesAsync(int adminId, DashboardFilterDto filter)
        {
            try
            {
                // Varsayılan filtre ayarları
                filter ??= new DashboardFilterDto
                {
                    StartDate = DateTime.Now.Date.AddDays(-7), // Başlangıç günü (1 hafta önce)
                    EndDate = DateTime.Now.Date.AddDays(1).AddSeconds(-1), // Bugünün sonu
                    PageSize = 5, // Sadece 5 aktivite
                    PageNumber = 1,
                    SortDirection = "desc" // En yeniden eskiye
                };

                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                    return ApiResponse<List<DashboardActivityDto>>.ErrorResult(Messages.AdminNotFound);

                var activities = new List<DashboardActivityDto>();

                // Şikayetleri getir
                var complaints = await _adminDal.GetComplaintsByDateRange(adminId, filter.StartDate.Value, filter.EndDate.Value);
                foreach (var complaint in complaints)
                {
                    activities.Add(new DashboardActivityDto
                    {
                        Id = complaint.Id,
                        ActivityType = "Complaint",
                        Title = "Şikayet",
                        Description = complaint.Description ?? string.Empty,
                        ActivityDate = complaint.CreatedAt,
                        RelatedEntity = $"Kullanıcı {complaint.UserId}",
                        Status = complaint.Status == 1 ? "Çözüldü" : "Bekliyor",
                        UserFullName = complaint.CreatedByName ?? string.Empty
                    });
                }

                // Ödemeleri getir
                var payments = await _adminDal.GetPaymentsByDateRange(adminId, filter.StartDate.Value, filter.EndDate.Value);
                foreach (var payment in payments)
                {
                    activities.Add(new DashboardActivityDto
                    {
                        Id = payment.Id,
                        ActivityType = "Payment",
                        Title = payment.PaymentType == "Dues" ? "Aidat Ödemesi" : "Kira Ödemesi",
                        Description = $"{payment.Amount:C2} tutarında ödeme",
                        ActivityDate = payment.PaymentDate,
                        RelatedEntity = $"Daire {payment.UserId}",
                        Status = payment.IsPaid ? "Ödendi" : "Bekliyor",
                        Amount = payment.Amount,
                        UserFullName = payment.UserFullName ?? string.Empty
                    });
                }

                // Toplantıları getir
                var meetings = await _adminDal.GetMeetingsByDateRange(adminId, filter.StartDate.Value, filter.EndDate.Value);
                foreach (var meeting in meetings)
                {
                    activities.Add(new DashboardActivityDto
                    {
                        Id = meeting.Id,
                        ActivityType = "Meeting",
                        Title = "Toplantı",
                        Description = meeting.Description ?? string.Empty,
                        ActivityDate = meeting.MeetingDate,
                        RelatedEntity = meeting.Location ?? string.Empty,
                        Status = meeting.MeetingDate > DateTime.Now ? "Planlandı" : "Tamamlandı",
                        UserFullName = meeting.OrganizedByName ?? string.Empty
                    });
                }

                // Sıralama (varsayılan olarak en yeniden en eskiye)
                activities = activities.OrderByDescending(a => a.ActivityDate).ToList();

                // Sadece istenen sayıda aktiviteyi al
                activities = activities.Take(filter.PageSize).ToList();

                if (!activities.Any())
                {
                    _logger.LogWarning($"No activities found for admin {adminId} between {filter.StartDate:d} - {filter.EndDate:d}");
                }

                return ApiResponse<List<DashboardActivityDto>>.SuccessResult(
                    Messages.Success,
                    activities);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting filtered activities: {ex.Message}");
                return ApiResponse<List<DashboardActivityDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> GetBuildingApartmentCountAsync(int buildingId)
        {
            try
            {
                var count = await _adminDal.GetBuildingApartmentCount(buildingId);
                return ApiResponse<int>.SuccessResult(Messages.Success, count);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building apartment count: {ex.Message}");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> GetEmptyApartmentsCountAsync(int adminId)
        {
            try
            {
                var count = await _adminDal.GetEmptyApartmentsCount(adminId);
                return ApiResponse<int>.SuccessResult(Messages.Success, count);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting empty apartments count: {ex.Message}");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<PaymentWithUserDto>>> GetLastPaymentsAsync(int adminId, int count = 5)
        {
            try
            {
                var payments = await _adminDal.GetLastPayments(adminId, count);
                return ApiResponse<List<PaymentWithUserDto>>.SuccessResult(Messages.Success, payments);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting last payments: {ex.Message}");
                return ApiResponse<List<PaymentWithUserDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<ComplaintWithUserDto>>> GetLastComplaintsAsync(int adminId, int count = 5)
        {
            try
            {
                var complaints = await _adminDal.GetLastComplaints(adminId, count);
                return ApiResponse<List<ComplaintWithUserDto>>.SuccessResult(Messages.Success, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting last complaints: {ex.Message}");
                return ApiResponse<List<ComplaintWithUserDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<decimal>> GetMonthlyIncomeAsync(int adminId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var income = await _adminDal.GetMonthlyIncome(adminId, startDate, endDate);
                return ApiResponse<decimal>.SuccessResult(Messages.Success, income);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting monthly income: {ex.Message}");
                return ApiResponse<decimal>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<(Building building, int complaintCount)>> GetMostComplainedBuildingAsync(int adminId)
        {
            try
            {
                var result = await _adminDal.GetMostComplainedBuilding(adminId);
                return ApiResponse<(Building building, int complaintCount)>.SuccessResult(Messages.Success, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting most complained building: {ex.Message}");
                return ApiResponse<(Building building, int complaintCount)>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<string>>> GetCommonComplaintsAsync(int buildingId, int count = 3)
        {
            try
            {
                var complaints = await _adminDal.GetCommonComplaints(buildingId, count);
                return ApiResponse<List<string>>.SuccessResult(Messages.Success, complaints);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting common complaints: {ex.Message}");
                return ApiResponse<List<string>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        // Yönetim Ekranı metodları
        public async Task<ApiResponse<ManagementDashboardDto>> GetManagementDashboardAsync(int adminId, ManagementFilterDto filter)
        {
            try
            {
                _logger.LogInformation($"Getting management dashboard for admin {adminId}");

                // Admin kontrolü
                var admin = await _adminDal.GetByIdAsync(adminId);
                if (admin == null)
                {
                    _logger.LogWarning($"Admin not found with ID: {adminId}");
                    return ApiResponse<ManagementDashboardDto>.ErrorResult("Yönetici bulunamadı.");
                }

                if (!admin.IsActive)
                {
                    _logger.LogWarning($"Admin with ID: {adminId} is not active");
                    return ApiResponse<ManagementDashboardDto>.ErrorResult("Yönetici hesabı aktif değil.");
                }

                var buildings = await _adminDal.GetBuildingsForManagement(adminId);
                _logger.LogInformation($"Retrieved {buildings?.Count ?? 0} buildings for admin {adminId}");

                if (buildings == null || !buildings.Any())
                {
                    _logger.LogWarning($"No buildings found for admin ID: {adminId}");
                    return ApiResponse<ManagementDashboardDto>.SuccessResult("Bu yöneticiye ait bina bulunamadı.", new ManagementDashboardDto());
                }

                var selectedBuilding = filter?.BuildingId != null
                    ? buildings.FirstOrDefault(b => b.Id == filter.BuildingId)
                    : null;

                _logger.LogInformation($"Selected building ID: {selectedBuilding?.Id ?? -1}");

                var result = new ManagementDashboardDto
                {
                    Buildings = buildings,
                    Apartments = new List<ApartmentBasicDto>(),
                    Tenants = new List<TenantBasicDto>(),
                    UpcomingMeetings = new List<MeetingBasicDto>(),
                    PendingComplaints = new List<ComplaintBasicDto>(),
                    OverduePayments = new List<PaymentBasicDto>(),
                    Statistics = new BuildingBasicStatsDto()
                };

                if (selectedBuilding != null)
                {
                    try
                    {
                        // Daire bilgilerini getir
                        var apartments = await _adminDal.GetApartmentsForManagement(filter.BuildingId.Value);
                        if (apartments != null)
                        {
                            result.Apartments = apartments.Select(a => new ApartmentBasicDto
                            {
                                Id = a.Id,
                                UnitNumber = a.UnitNumber.ToString(),
                                Floor = a.Floor,
                                Status = a.Status,
                                TenantName = a.TenantFullName ?? string.Empty
                            }).ToList();
                        }

                        // Kiracı bilgilerini getir
                        var tenants = await _adminDal.GetTenantsForManagement(filter.BuildingId.Value);
                        if (tenants != null)
                        {
                            result.Tenants = tenants.Select(t => new TenantBasicDto
                            {
                                Id = t.Id,
                                FullName = t.FullName ?? string.Empty,
                                ApartmentNumber = t.ApartmentNumber ?? string.Empty,
                                PhoneNumber = t.PhoneNumber ?? string.Empty,
                                Email = t.Email ?? string.Empty,
                                ProfileImage = t.ProfileImageUrl ?? string.Empty,
                                ContractFile = t.ContractFile ?? string.Empty
                            }).ToList();
                        }

                        // Toplantı bilgilerini getir
                        var meetings = await _adminDal.GetMeetingsForManagement(filter.BuildingId.Value);
                        if (meetings != null)
                        {
                            result.UpcomingMeetings = meetings.Select(m => new MeetingBasicDto
                            {
                                Id = m.Id,
                                Title = m.Title ?? string.Empty,
                                MeetingDate = m.MeetingDate,
                                Location = m.Location ?? string.Empty
                            }).ToList();
                        }

                        // Şikayet bilgilerini getir
                        var complaints = await _adminDal.GetComplaintsForManagement(filter.BuildingId.Value);
                        if (complaints != null)
                        {
                            result.PendingComplaints = complaints
                                .Where(c => c.Status == "Bekliyor")
                                .Select(c => new ComplaintBasicDto
                                {
                                    Id = c.Id,
                                    Subject = c.Subject ?? string.Empty,
                                    CreatedAt = c.CreatedAt,
                                    ApartmentNumber = c.ApartmentNumber ?? string.Empty
                                }).ToList();
                        }

                        // Ödeme bilgilerini getir
                        var payments = await _adminDal.GetPaymentsForManagement(filter.BuildingId.Value);
                        if (payments != null)
                        {
                            result.OverduePayments = payments
                                .Where(p => !p.PaymentDate.HasValue && p.DueDate < DateTime.Now)
                                .Select(p => new PaymentBasicDto
                                {
                                    Id = p.Id,
                                    PaymentType = p.PaymentType ?? string.Empty,
                                    Amount = p.Amount,
                                    DueDate = p.DueDate,
                                    ApartmentNumber = p.ApartmentNumber ?? string.Empty
                                }).ToList();
                        }

                        // İstatistik bilgilerini getir
                        var stats = await _adminDal.GetBuildingStatistics(filter.BuildingId.Value);
                        if (stats != null)
                        {
                            result.Statistics = new BuildingBasicStatsDto
                            {
                                OccupancyRate = stats.OccupancyRate,
                                LastMaintenanceDate = DateTime.Now.AddDays(-stats.DaysSinceLastMaintenance)
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error getting building details: {ex.Message}");
                        // Hata durumunda boş listeler ile devam et
                    }
                }

                var successMessage = selectedBuilding != null
                    ? $"{(selectedBuilding.Name ?? "Bilinmeyen Bina")} binası yönetim bilgileri başarıyla getirildi"
                    : "Yönetim bilgileri başarıyla getirildi";

                return ApiResponse<ManagementDashboardDto>.SuccessResult(successMessage, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetManagementDashboardAsync: {ex.Message}");
                return ApiResponse<ManagementDashboardDto>.ErrorResult($"Yönetim paneli bilgileri alınırken hata oluştu: {ex.Message}");
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
    }
}