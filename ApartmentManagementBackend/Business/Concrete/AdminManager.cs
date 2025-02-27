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
        private readonly ILogger<AdminManager> _logger;

        public AdminManager(
            IUserDal userDal,
            IBuildingDal buildingDal,
            ITenantDal tenantDal,
            IApartmentDal apartmentDal,
            INotificationDal notificationDal,
            IMeetingDal meetingDal,
            IAdminDal adminDal,
            ILogger<AdminManager> logger)
        {
            _userDal = userDal;
            _buildingDal = buildingDal;
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
            _notificationDal = notificationDal;
            _meetingDal = meetingDal;
            _adminDal = adminDal;
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
    }
}
