using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfAdminDal : EfEntityRepositoryBase<Admin, ApartmentManagementDbContext>, IAdminDal
    {
        private readonly ILogger<EfAdminDal> _logger;

        public EfAdminDal(ApartmentManagementDbContext context, ILogger<EfAdminDal> logger) : base(context)
        {
            _logger = logger;
        }

        public async Task<int> GetTotalResidentsCount(int adminId)
        {
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            return await _context.Tenants
                .Where(t => _context.Apartments
                    .Where(a => buildings.Contains(a.BuildingId))
                    .Select(a => a.Id)
                    .Contains(t.ApartmentId))
                .CountAsync();
        }

        public async Task<List<Building>> GetManagedBuildings(int adminId)
        {
            var admin = await _context.Admins.FindAsync(adminId);
            if (admin == null)
            {
                throw new KeyNotFoundException($"Admin with ID {adminId} not found.");
            }

            return await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .ToListAsync() ?? new List<Building>();
        }

        public async Task<int> GetBuildingApartmentCount(int buildingId)
        {
            return await _context.Apartments
                .Where(a => a.BuildingId == buildingId)
                .CountAsync();
        }

        public async Task<int> GetOccupiedApartmentCount(int buildingId)
        {
            return await _context.Apartments
                .Where(a => a.BuildingId == buildingId && a.IsOccupied)
                .CountAsync();
        }

        public async Task<decimal> GetTotalMonthlyIncome(int adminId)
        {
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            var apartments = await _context.Apartments
                .Where(a => buildings.Contains(a.BuildingId))
                .ToListAsync();

            return apartments.Sum(a => a.RentAmount);
        }

        public async Task<List<Payment>> GetRecentPayments(int adminId, int count = 10)
        {
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            var tenantIds = await _context.Tenants
                .Where(t => _context.Apartments
                    .Where(a => buildings.Contains(a.BuildingId))
                    .Select(a => a.Id)
                    .Contains(t.ApartmentId))
                .Select(t => t.Id)
                .ToListAsync();

            return await _context.Payments
                .Where(p => tenantIds.Contains(p.UserId))
                .Join(_context.Users,
                    p => p.UserId,
                    u => u.Id,
                    (p, u) => new Payment
                    {
                        Id = p.Id,
                        UserId = p.UserId,
                        CardInfoId = p.CardInfoId,
                        PaymentType = p.PaymentType,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,
                        DueDate = p.DueDate,
                        IsPaid = p.IsPaid,
                        Description = p.Description,
                        UserFullName = $"{u.FirstName} {u.LastName}"
                    })
                .OrderByDescending(p => p.PaymentDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<Complaint>> GetActiveComplaints(int adminId)
        {
            try
            {
                // Admin'in yönettiği binaları al
                var buildingIds = await _context.Buildings
                    .Where(b => b.AdminId == adminId)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (!buildingIds.Any())
                {
                    _logger.LogWarning($"No buildings found for admin with ID: {adminId}");
                    return new List<Complaint>();
                }

                // Bu binalara ait aktif şikayetleri al
                var complaints = await _context.Complaints
                    .Where(c => buildingIds.Contains(c.BuildingId) &&
                              (c.Status == (int)ComplaintStatus.Open || c.Status == (int)ComplaintStatus.InProgress))
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return complaints;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while getting active complaints for admin with ID: {adminId}");
                throw;
            }
        }

        public async Task<List<Meeting>> GetUpcomingMeetings(int adminId)
        {
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            return await _context.Meetings
                .Where(m => buildings.Contains(m.BuildingId) && m.MeetingDate > DateTime.Now)
                .OrderBy(m => m.MeetingDate)
                .ToListAsync();
        }

        public new async Task<Admin?> GetByIdAsync(int id)
        {
            return await _context.Admins.FindAsync(id);
        }

        public new async Task UpdateAsync(Admin admin)
        {
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
        }

        public async Task<List<int>> GetBuildingTenants(int buildingId)
        {
            return await _context.Tenants
                .Where(t => _context.Apartments
                    .Where(a => a.BuildingId == buildingId)
                    .Select(a => a.Id)
                    .Contains(t.ApartmentId))
                .Select(t => t.Id)
                .ToListAsync();
        }

        public async Task<List<Complaint>> GetComplaintsByDateRange(int adminId, DateTime startDate, DateTime endDate)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Complaints
                .Where(c => buildingIds.Contains(c.BuildingId) &&
                           c.CreatedAt >= startDate &&
                           c.CreatedAt <= endDate)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Payment>> GetPaymentsByDateRange(int adminId, DateTime startDate, DateTime endDate)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Payments
                .Where(p => buildingIds.Contains(p.BuildingId) &&
                           p.PaymentDate >= startDate &&
                           p.PaymentDate <= endDate)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<List<Meeting>> GetMeetingsByDateRange(int adminId, DateTime startDate, DateTime endDate)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Meetings
                .Where(m => buildingIds.Contains(m.BuildingId) &&
                           m.MeetingDate >= startDate &&
                           m.MeetingDate <= endDate)
                .OrderByDescending(m => m.MeetingDate)
                .ToListAsync();
        }

        public async Task<int> GetEmptyApartmentsCount(int adminId)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Apartments
                .Where(a => buildingIds.Contains(a.BuildingId) &&
                           a.Status == "available")
                .CountAsync();
        }

        public async Task<List<PaymentWithUserDto>> GetLastPayments(int adminId, int count = 5)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Payments
                .Where(p => buildingIds.Contains(p.BuildingId))
                .OrderByDescending(p => p.PaymentDate)
                .Take(count)
                .Join(_context.Users,
                    p => p.UserId,
                    u => u.Id,
                    (p, u) => new { Payment = p, User = u })
                .Join(_context.Apartments,
                    pu => pu.Payment.ApartmentId,
                    a => a.Id,
                    (pu, a) => new PaymentWithUserDto
                    {
                        Id = pu.Payment.Id,
                        PaymentType = pu.Payment.PaymentType,
                        Amount = pu.Payment.Amount,
                        PaymentDate = pu.Payment.PaymentDate,
                        BuildingId = pu.Payment.BuildingId,
                        ApartmentId = a.UnitNumber,
                        UserId = pu.Payment.UserId,
                        IsPaid = pu.Payment.IsPaid,
                        UserFullName = $"{pu.User.FirstName ?? string.Empty} {pu.User.LastName ?? string.Empty}",
                        ProfileImageUrl = pu.User.ProfileImageUrl ?? string.Empty
                    })
                .ToListAsync();
        }

        public async Task<List<ComplaintWithUserDto>> GetLastComplaints(int adminId, int count = 5)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Complaints
                .Where(c => buildingIds.Contains(c.BuildingId))
                .OrderByDescending(c => c.CreatedAt)
                .Take(count)
                .Join(_context.Users,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new ComplaintWithUserDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        Description = c.Description ?? string.Empty,
                        CreatedAt = c.CreatedAt,
                        BuildingId = c.BuildingId,
                        UserId = c.UserId,
                        Status = c.Status ?? 0,
                        CreatedByName = $"{u.FirstName ?? string.Empty} {u.LastName ?? string.Empty}",
                        ProfileImageUrl = u.ProfileImageUrl ?? string.Empty
                    })
                .ToListAsync();
        }

        public async Task<decimal> GetMonthlyIncome(int adminId, DateTime startDate, DateTime endDate)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            return await _context.Payments
                .Where(p => buildingIds.Contains(p.BuildingId) &&
                           p.PaymentDate >= startDate &&
                           p.PaymentDate <= endDate &&
                           p.IsPaid)
                .SumAsync(p => p.Amount);
        }

        public async Task<(Building? building, int complaintCount)> GetMostComplainedBuilding(int adminId)
        {
            var buildings = await GetManagedBuildings(adminId);

            if (!buildings.Any())
                return (null, 0);

            var complaintsPerBuilding = await _context.Complaints
                .Where(c => buildings.Select(b => b.Id).Contains(c.BuildingId))
                .GroupBy(c => c.BuildingId)
                .Select(g => new { BuildingId = g.Key, ComplaintCount = g.Count() })
                .OrderByDescending(x => x.ComplaintCount)
                .FirstOrDefaultAsync();

            if (complaintsPerBuilding == null)
                return (null, 0);

            var building = buildings.FirstOrDefault(b => b.Id == complaintsPerBuilding.BuildingId);
            return (building, complaintsPerBuilding.ComplaintCount);
        }

        public async Task<List<string>> GetCommonComplaints(int buildingId, int count = 3)
        {
            return await _context.Complaints
                .Where(c => c.BuildingId == buildingId)
                .GroupBy(c => c.Subject)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .Take(count)
                .ToListAsync();
        }

        // Yönetim Ekranı için metodlar
        public async Task<List<BuildingManagementDto>> GetBuildingsForManagement(int adminId)
        {
            var buildings = await GetManagedBuildings(adminId);
            var result = new List<BuildingManagementDto>();

            foreach (var building in buildings)
            {
                var occupiedCount = await GetOccupiedApartmentCount(building.Id);
                var totalApartments = await GetBuildingApartmentCount(building.Id);
                var occupancyRate = totalApartments > 0 ? (decimal)occupiedCount / totalApartments * 100 : 0;

                var activeComplaints = await _context.Complaints
                    .Where(c => c.BuildingId == building.Id && c.Status == 0)
                    .CountAsync();

                var pendingPayments = await _context.Payments
                    .Where(p => p.BuildingId == building.Id && !p.IsPaid)
                    .CountAsync();

                var emptyApartments = totalApartments - occupiedCount;

                var tenants = await GetBuildingTenants(building.Id);

                result.Add(new BuildingManagementDto
                {
                    Id = building.Id,
                    Name = building.BuildingName,
                    FloorCount = building.NumberOfFloors,
                    TotalApartments = totalApartments,
                    OccupancyRate = occupancyRate,
                    LastMaintenanceDate = building.LastMaintenanceDate == default(DateTime) ? DateTime.Now.AddMonths(-3) : building.LastMaintenanceDate,
                    EmptyApartmentsCount = emptyApartments,
                    TotalResidentsCount = tenants.Count,
                    ActiveComplaintsCount = activeComplaints,
                    PendingPaymentsCount = pendingPayments
                });
            }

            return result;
        }

        public async Task<List<ApartmentManagementDto>> GetApartmentsForManagement(int buildingId)
        {
            var apartments = await _context.Apartments
                .Where(a => a.BuildingId == buildingId)
                .ToListAsync();

            var result = new List<ApartmentManagementDto>();

            foreach (var apartment in apartments)
            {
                // Get tenant name if exists
                string tenantName = string.Empty;
                // Since TenantId doesn't exist, we'll use a different approach
                var tenant = await _context.Users
                    .FirstOrDefaultAsync(u => _context.Payments
                        .Any(p => p.ApartmentId == apartment.Id && p.UserId == u.Id));

                if (tenant != null)
                {
                    tenantName = $"{tenant.FirstName} {tenant.LastName}";
                }

                // Get owner name if exists
                string ownerName = string.Empty;
                if (apartment.OwnerId > 0)
                {
                    var owner = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == apartment.OwnerId);
                    if (owner != null)
                    {
                        ownerName = $"{owner.FirstName} {owner.LastName}";
                    }
                }

                // Get last payment date
                var lastPayment = await _context.Payments
                    .Where(p => p.ApartmentId == apartment.Id && p.IsPaid)
                    .OrderByDescending(p => p.PaymentDate)
                    .FirstOrDefaultAsync();

                result.Add(new ApartmentManagementDto
                {
                    Id = apartment.Id,
                    UnitNumber = apartment.UnitNumber,
                    Floor = apartment.Floor,
                    Status = apartment.IsOccupied ? "Dolu" : "Boş",
                    BuildingId = apartment.BuildingId,
                    RentAmount = apartment.RentAmount,
                    DuesAmount = apartment.DepositAmount, // Using DepositAmount instead of MonthlyDues
                    TenantFullName = tenantName,
                    OwnerFullName = ownerName,
                    LastPaymentDate = lastPayment?.PaymentDate
                });
            }

            return result;
        }

        public async Task<List<TenantManagementDto>> GetTenantsForManagement(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting tenants for building {buildingId}");

                // Binanın varlığını kontrol et
                var building = await _context.Buildings.FindAsync(buildingId);
                if (building == null)
                {
                    _logger.LogWarning($"Building with ID {buildingId} not found");
                    return new List<TenantManagementDto>();
                }

                // Önce binadaki dolu daireleri bul
                var occupiedApartments = await _context.Apartments
                    .Where(a => a.BuildingId == buildingId && a.IsOccupied)
                    .ToListAsync();

                _logger.LogInformation($"Found {occupiedApartments.Count} occupied apartments in building {buildingId}");

                if (!occupiedApartments.Any())
                {
                    _logger.LogWarning($"No occupied apartments found in building {buildingId}");
                    return new List<TenantManagementDto>();
                }

                var result = new List<TenantManagementDto>();

                // Tüm dairelerin ID'lerini al
                var apartmentIds = occupiedApartments.Select(a => a.Id).ToList();

                // Tüm ödemeleri tek sorguda al
                var latestPayments = await _context.Payments
                    .Where(p => apartmentIds.Contains(p.ApartmentId))
                    .GroupBy(p => p.ApartmentId)
                    .Select(g => g.OrderByDescending(p => p.PaymentDate).First())
                    .ToListAsync();

                _logger.LogInformation($"Found {latestPayments.Count} latest payments for occupied apartments");

                // Tüm kullanıcı ID'lerini topla
                var userIds = latestPayments.Select(p => p.UserId).Distinct().ToList();

                // Tüm kullanıcıları ve sözleşmelerini tek sorguda al
                var usersWithContracts = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new
                    {
                        User = u,
                        Contract = _context.Contracts
                            .Where(c => c.TenantId == u.Id && c.IsActive)
                            .OrderByDescending(c => c.StartDate)
                            .FirstOrDefault()
                    })
                    .ToDictionaryAsync(x => x.User.Id);

                _logger.LogInformation($"Found {usersWithContracts.Count} users with contracts");

                foreach (var apartment in occupiedApartments)
                {
                    _logger.LogInformation($"Processing apartment {apartment.UnitNumber}");

                    var latestPayment = latestPayments.FirstOrDefault(p => p.ApartmentId == apartment.Id);
                    if (latestPayment == null)
                    {
                        _logger.LogWarning($"No payment found for apartment {apartment.UnitNumber}");
                        continue;
                    }

                    if (!usersWithContracts.TryGetValue(latestPayment.UserId, out var userWithContract))
                    {
                        _logger.LogWarning($"No user found for UserId: {latestPayment.UserId}, Apartment: {apartment.UnitNumber}");
                        continue;
                    }

                    var tenant = userWithContract.User;
                    var contract = userWithContract.Contract;

                    _logger.LogInformation($"Found tenant {tenant.FirstName} {tenant.LastName} for apartment {apartment.UnitNumber}");

                    // Aktif şikayetleri say
                    var activeComplaints = await _context.Complaints
                        .Where(c => c.UserId == tenant.Id && c.Status == 0)
                        .CountAsync();

                    var tenantInfo = new TenantManagementDto
                    {
                        Id = tenant.Id,
                        FullName = $"{tenant.FirstName} {tenant.LastName}".Trim(),
                        PhoneNumber = tenant.PhoneNumber ?? string.Empty,
                        ApartmentNumber = $"Daire {apartment.UnitNumber}",
                        ProfileImageUrl = tenant.ProfileImageUrl ?? string.Empty,
                        LastPaymentDate = latestPayment.PaymentDate,
                        ActiveComplaintsCount = activeComplaints,
                        Email = tenant.Email ?? string.Empty,
                        MoveInDate = apartment.CreatedAt,
                        ContractEndDate = contract?.EndDate,
                        ContractFile = contract?.ContractFile ?? string.Empty
                    };

                    result.Add(tenantInfo);
                    _logger.LogInformation($"Added tenant info for apartment {apartment.UnitNumber}");
                }

                _logger.LogInformation($"Returning {result.Count} tenant records for building {buildingId}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting tenants for building {buildingId}: {ex.Message}");
                _logger.LogError(ex.StackTrace);
                return new List<TenantManagementDto>();
            }
        }

        public async Task<List<MeetingManagementDto>> GetMeetingsForManagement(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting meetings for building {buildingId}");
                var meetings = await _context.Meetings
                    .Where(m => m.BuildingId == buildingId)
                    .OrderByDescending(m => m.MeetingDate)
                    .ToListAsync();

                _logger.LogInformation($"Found {meetings.Count} meetings for building {buildingId}");

                var result = meetings.Select(m => new MeetingManagementDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    MeetingDate = m.MeetingDate,
                    Location = m.Location,
                    OrganizedBy = m.OrganizedByName,
                    Agenda = m.Description,
                    ParticipantsCount = 0,
                    IsCompleted = m.MeetingDate < DateTime.Now,
                    BuildingId = m.BuildingId
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting meetings for building {buildingId}: {ex.Message}");
                return new List<MeetingManagementDto>();
            }
        }

        public async Task<List<ComplaintManagementDto>> GetComplaintsForManagement(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting complaints for building {buildingId}");
                var complaints = await _context.Complaints
                    .Where(c => c.BuildingId == buildingId)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation($"Found {complaints.Count} complaints for building {buildingId}");

                var result = new List<ComplaintManagementDto>();
                foreach (var c in complaints)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == c.UserId);
                    var apartment = await _context.Apartments
                        .FirstOrDefaultAsync(a => _context.Payments
                            .Any(p => p.ApartmentId == a.Id && p.UserId == c.UserId));

                    result.Add(new ComplaintManagementDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        ComplainerName = user != null ? $"{user.FirstName} {user.LastName}" : string.Empty,
                        ProfileImageUrl = user?.ProfileImageUrl ?? string.Empty,
                        ApartmentNumber = apartment != null ? $"Daire {apartment.UnitNumber}" : string.Empty,
                        DaysOpen = (int)(DateTime.Now - c.CreatedAt).TotalDays,
                        Status = c.Status switch
                        {
                            (int)ComplaintStatus.Resolved => "Çözüldü",
                            (int)ComplaintStatus.InProgress => "İşlemde",
                            (int)ComplaintStatus.Rejected => "Reddedildi",
                            _ => "Açık"
                        },
                        CreatedAt = c.CreatedAt,
                        Description = c.Description,
                        BuildingId = c.BuildingId
                    });
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting complaints for building {buildingId}: {ex.Message}");
                return new List<ComplaintManagementDto>();
            }
        }

        public async Task<List<PaymentManagementDto>> GetPaymentsForManagement(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting payments for building {buildingId}");
                var payments = await _context.Payments
                    .Where(p => p.BuildingId == buildingId && !p.IsPaid && p.DueDate < DateTime.Now)
                    .OrderByDescending(p => p.DueDate)
                    .ToListAsync();

                _logger.LogInformation($"Found {payments.Count} overdue payments for building {buildingId}");

                var result = new List<PaymentManagementDto>();
                foreach (var p in payments)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == p.UserId);
                    var apartment = await _context.Apartments.FirstOrDefaultAsync(a => a.Id == p.ApartmentId);

                    result.Add(new PaymentManagementDto
                    {
                        Id = p.Id,
                        TenantFullName = user != null ? $"{user.FirstName} {user.LastName}" : string.Empty,
                        ProfileImageUrl = user?.ProfileImageUrl ?? string.Empty,
                        Amount = p.Amount,
                        PaymentType = p.PaymentType,
                        PaymentDate = p.PaymentDate,
                        DueDate = p.DueDate,
                        Status = p.IsPaid ? "Ödendi" : "Ödenmedi",
                        ApartmentNumber = apartment != null ? $"Daire {apartment.UnitNumber}" : string.Empty,
                        BuildingId = p.BuildingId
                    });
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting payments for building {buildingId}: {ex.Message}");
                return new List<PaymentManagementDto>();
            }
        }

        public async Task<List<NotificationManagementDto>> GetNotificationsForManagement(int adminId)
        {
            return await _context.Notifications
                .Where(n => n.CreatedByAdminId == adminId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationManagementDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Recipients = n.UserId == 0 ? "Tüm Kullanıcılar" : $"Kullanıcı {n.UserId}",
                    CreatedAt = n.CreatedAt,
                    SentCount = 1,
                    ReadCount = n.IsRead ? 1 : 0,
                    CreatedByAdminId = n.CreatedByAdminId
                })
                .ToListAsync();
        }

        public async Task<BuildingStatisticsDto> GetBuildingStatistics(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting statistics for building {buildingId}");

                var building = await _context.Buildings.FindAsync(buildingId);
                if (building == null)
                {
                    _logger.LogWarning($"Building {buildingId} not found");
                    return new BuildingStatisticsDto();
                }

                var totalApartments = await GetBuildingApartmentCount(buildingId);
                var occupiedCount = await GetOccupiedApartmentCount(buildingId);
                var emptyApartments = totalApartments - occupiedCount;
                var occupancyRate = totalApartments > 0 ? (decimal)occupiedCount / totalApartments * 100 : 0;

                _logger.LogInformation($"Building {buildingId} stats: Total={totalApartments}, Occupied={occupiedCount}, Empty={emptyApartments}, Rate={occupancyRate}%");

                var now = DateTime.Now;
                var thirtyDaysAgo = now.AddDays(-30);

                var last30DaysIncome = await _context.Payments
                    .Where(p => p.BuildingId == buildingId && p.IsPaid && p.PaymentDate >= thirtyDaysAgo)
                    .SumAsync(p => p.Amount);

                var delayedPayments = await GetDelayedPaymentsCount(buildingId);
                var openComplaints = await _context.Complaints
                    .Where(c => c.BuildingId == buildingId && c.Status == 0)
                    .CountAsync();

                _logger.LogInformation($"Building {buildingId} additional stats: Last30DaysIncome={last30DaysIncome}, DelayedPayments={delayedPayments}, OpenComplaints={openComplaints}");

                var daysSinceLastMeeting = await GetDaysSinceLastMeeting(buildingId);
                var daysSinceLastMaintenance = await GetDaysSinceLastMaintenance(buildingId);

                var startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-5);
                var endDate = new DateTime(now.Year, now.Month, 1).AddMonths(1).AddDays(-1);

                var monthlyIncomeChart = await GetMonthlyIncomeChart(buildingId, startDate, endDate);
                var occupancyRateChart = await GetOccupancyRateChart(buildingId, startDate, endDate);

                return new BuildingStatisticsDto
                {
                    TotalApartments = totalApartments,
                    EmptyApartments = emptyApartments,
                    OccupancyRate = occupancyRate,
                    Last30DaysIncome = last30DaysIncome,
                    DelayedPaymentsCount = delayedPayments,
                    OpenComplaintsCount = openComplaints,
                    DaysSinceLastMeeting = daysSinceLastMeeting,
                    DaysSinceLastMaintenance = daysSinceLastMaintenance,
                    MonthlyIncomeChart = monthlyIncomeChart,
                    OccupancyRateChart = occupancyRateChart
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting building statistics for building {buildingId}: {ex.Message}");
                return new BuildingStatisticsDto();
            }
        }

        public async Task<Dictionary<string, decimal>> GetMonthlyIncomeChart(int buildingId, DateTime startDate, DateTime endDate)
        {
            var payments = await _context.Payments
                .Where(p => p.BuildingId == buildingId && p.IsPaid && p.PaymentDate >= startDate && p.PaymentDate <= endDate)
                .ToListAsync();

            var result = new Dictionary<string, decimal>();

            for (var date = startDate; date <= endDate; date = date.AddMonths(1))
            {
                var monthYear = date.ToString("MMM yyyy");
                var monthStart = new DateTime(date.Year, date.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var monthlyTotal = payments
                    .Where(p => p.PaymentDate >= monthStart && p.PaymentDate <= monthEnd)
                    .Sum(p => p.Amount);

                result[monthYear] = monthlyTotal;
            }

            return result;
        }

        public async Task<Dictionary<string, decimal>> GetOccupancyRateChart(int buildingId, DateTime startDate, DateTime endDate)
        {
            var result = new Dictionary<string, decimal>();
            var turkishCulture = new System.Globalization.CultureInfo("tr-TR");

            // Get current occupancy rate
            var building = await _context.Buildings.FirstOrDefaultAsync(b => b.Id == buildingId);
            if (building == null)
            {
                return result;
            }

            // Calculate current occupancy rate
            var totalApartments = await GetBuildingApartmentCount(buildingId);
            var occupiedCount = await GetOccupiedApartmentCount(buildingId);
            var currentRate = totalApartments > 0 ? (decimal)occupiedCount / totalApartments * 100 : 0;

            for (var date = startDate; date <= endDate; date = date.AddMonths(1))
            {
                var monthYear = date.ToString("MMM yyyy", turkishCulture);

                // Sadece mevcut ay için gerçek doluluk oranını göster
                if (date.Year == DateTime.Now.Year && date.Month == DateTime.Now.Month)
                {
                    result[monthYear] = currentRate;
                }
                else
                {
                    // Geçmiş aylar için 0 göster
                    result[monthYear] = 0;
                }
            }

            return result;
        }

        public async Task<int> GetDelayedPaymentsCount(int buildingId)
        {
            return await _context.Payments
                .Where(p => p.BuildingId == buildingId && !p.IsPaid && p.DueDate < DateTime.Now)
                .CountAsync();
        }

        public async Task<int> GetDaysSinceLastMeeting(int buildingId)
        {
            var lastMeeting = await _context.Meetings
                .Where(m => m.BuildingId == buildingId && m.MeetingDate < DateTime.Now)
                .OrderByDescending(m => m.MeetingDate)
                .FirstOrDefaultAsync();

            if (lastMeeting == null)
                return 90; // Varsayılan değer

            return (int)(DateTime.Now - lastMeeting.MeetingDate).TotalDays;
        }

        public async Task<int> GetDaysSinceLastMaintenance(int buildingId)
        {
            try
            {
                _logger.LogInformation($"Getting last maintenance date for building {buildingId}");

                var building = await _context.Buildings.FindAsync(buildingId);
                if (building == null)
                {
                    _logger.LogWarning($"Building {buildingId} not found");
                    return 180;
                }

                if (building.LastMaintenanceDate == default(DateTime))
                {
                    _logger.LogInformation($"No maintenance date set for building {buildingId}, using default");
                    return 180;
                }

                var days = (int)(DateTime.Now - building.LastMaintenanceDate).TotalDays;
                _logger.LogInformation($"Building {buildingId} last maintenance was {days} days ago");

                return days;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting days since last maintenance for building {buildingId}: {ex.Message}");
                return 180;
            }
        }
    }
}