using DataAccess.Abstract;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfReportDal : IReportDal
    {
        private readonly ApartmentManagementDbContext _context;
        private readonly ILogger<EfReportDal> _logger;

        public EfReportDal(ApartmentManagementDbContext context, ILogger<EfReportDal> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AdminReportDto> GetAdminReportAsync(int adminId, int? buildingId = null)
        {
            var report = new AdminReportDto();

            try
            {
                _logger.LogInformation($"Getting building summary for admin {adminId}");
                report.BuildingSummary = await GetBuildingSummaryAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building summary");
                report.BuildingSummary = new BuildingReportSummaryDto();
            }

            try
            {
                _logger.LogInformation($"Getting recent surveys for admin {adminId}");
                report.RecentSurveys = await GetRecentSurveysAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent surveys");
                report.RecentSurveys = new List<SurveyReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting recent complaints for admin {adminId}");
                report.RecentComplaints = await GetRecentComplaintsAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent complaints");
                report.RecentComplaints = new List<ComplaintReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting recent tenants for admin {adminId}");
                report.RecentTenants = await GetRecentTenantsAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent tenants");
                report.RecentTenants = new List<TenantReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting expiring contracts for admin {adminId}");
                report.ExpiringContracts = await GetExpiringContractsAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expiring contracts");
                report.ExpiringContracts = new List<TenantReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting recent notifications for admin {adminId}");
                report.RecentNotifications = await GetRecentNotificationsAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications");
                report.RecentNotifications = new List<NotificationReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting recent meetings for admin {adminId}");
                report.RecentMeetings = await GetRecentMeetingsAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent meetings");
                report.RecentMeetings = new List<MeetingReportDto>();
            }

            try
            {
                _logger.LogInformation($"Getting financial summary for admin {adminId}");
                report.FinancialSummary = await GetFinancialSummaryAsync(adminId, buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial summary");
                report.FinancialSummary = new FinancialReportDto();
            }

            return report;
        }

        public async Task<BuildingReportSummaryDto> GetBuildingSummaryAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = _context.Buildings.Where(b => b.AdminId == adminId);
                if (buildingId.HasValue)
                {
                    query = query.Where(b => b.Id == buildingId.Value);
                }

                var buildings = await query.ToListAsync();
                var buildingIds = buildings.Select(b => b.Id).ToList();

                var apartments = await _context.Apartments
                    .Where(a => buildingIds.Contains(a.BuildingId))
                    .ToListAsync();

                var tenants = await _context.Tenants
                    .Where(t => apartments.Select(a => a.Id).Contains(t.ApartmentId))
                    .ToListAsync();

                var complaints = await _context.Complaints
                    .Where(c => buildingIds.Contains(c.BuildingId) && c.Status != 2)
                    .ToListAsync();

                var payments = await _context.Payments
                    .Where(p => buildingIds.Contains(p.BuildingId) && !p.IsPaid)
                    .ToListAsync();

                // Get highest income building
                var buildingIncomes = await GetBuildingIncomes(buildingIds);
                var highestIncomeBuilding = buildingIncomes.OrderByDescending(b => b.MonthlyIncome).FirstOrDefault();
                var highestRentBuilding = buildingIncomes.OrderByDescending(b => b.AverageRent).FirstOrDefault();

                return new BuildingReportSummaryDto
                {
                    TotalBuildings = buildings.Count,
                    TotalApartments = apartments.Count,
                    OccupiedApartments = apartments.Count(a => a.IsOccupied),
                    EmptyApartments = apartments.Count(a => !a.IsOccupied),
                    OccupancyRate = apartments.Any() ?
                        (decimal)apartments.Count(a => a.IsOccupied) / apartments.Count * 100 : 0,
                    TotalTenants = tenants.Count,
                    ActiveComplaints = complaints.Count,
                    PendingPayments = payments.Count,
                    TotalMonthlyIncome = payments.Sum(p => p.Amount),
                    HighestIncomeBuilding = highestIncomeBuilding ?? new BuildingIncomeDto(),
                    HighestRentBuilding = highestRentBuilding ?? new BuildingIncomeDto()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        private async Task<List<BuildingIncomeDto>> GetBuildingIncomes(List<int> buildingIds)
        {
            var result = new List<BuildingIncomeDto>();

            foreach (var buildingId in buildingIds)
            {
                var building = await _context.Buildings.FindAsync(buildingId);
                if (building == null) continue;

                var apartments = await _context.Apartments
                    .Where(a => a.BuildingId == buildingId)
                    .ToListAsync();

                var monthlyIncome = await _context.Payments
                    .Where(p => p.BuildingId == buildingId && p.IsPaid &&
                           p.PaymentDate >= DateTime.Now.AddMonths(-1))
                    .SumAsync(p => p.Amount);

                result.Add(new BuildingIncomeDto
                {
                    BuildingId = buildingId,
                    BuildingName = building.BuildingName,
                    MonthlyIncome = monthlyIncome,
                    AverageRent = apartments.Any() ? apartments.Average(a => a.RentAmount) : 0,
                    TotalApartments = apartments.Count,
                    OccupancyRate = apartments.Any() ?
                        (decimal)apartments.Count(a => a.IsOccupied) / apartments.Count * 100 : 0
                });
            }

            return result;
        }

        public async Task<List<SurveyReportDto>> GetRecentSurveysAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = _context.Surveys.Where(s => s.CreatedByAdminId == adminId);
                if (buildingId.HasValue)
                {
                    query = query.Where(s => s.BuildingId == buildingId);
                }

                return await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(10)
                    .Select(s => new SurveyReportDto
                    {
                        Id = s.Id,
                        Title = s.Title,
                        CreatedAt = s.CreatedAt,
                        TotalParticipants = s.TotalResponses,
                        ResponseCount = s.TotalResponses,
                        ParticipationRate = s.TotalResponses > 0 ?
                            100 : 0,
                        EndDate = s.EndDate,
                        IsActive = s.IsActive
                    })
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent surveys for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<List<ComplaintReportDto>> GetRecentComplaintsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = _context.Complaints
                    .Join(_context.Buildings.Where(b => b.AdminId == adminId),
                        c => c.BuildingId,
                        b => b.Id,
                        (c, b) => new { Complaint = c, Building = b });

                if (buildingId.HasValue)
                {
                    query = query.Where(x => x.Complaint.BuildingId == buildingId);
                }

                return await query
                    .OrderByDescending(x => x.Complaint.CreatedAt)
                    .Take(10)
                    .Select(x => new ComplaintReportDto
                    {
                        Id = x.Complaint.Id,
                        Subject = x.Complaint.Subject,
                        CreatedAt = x.Complaint.CreatedAt,
                        Status = x.Complaint.Status == 2 ? "Çözüldü" :
                                x.Complaint.Status == 1 ? "İşleme Alındı" : "Bekliyor",
                        BuildingId = x.Building.Id,
                        BuildingName = x.Building.BuildingName,
                        TenantName = x.Complaint.CreatedByName,
                        DaysOpen = (int)(DateTime.Now - x.Complaint.CreatedAt).TotalDays,
                        ResolvedAt = x.Complaint.ResolvedAt
                    })
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent complaints for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<List<TenantReportDto>> GetRecentTenantsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = from t in _context.Tenants
                            join a in _context.Apartments on t.ApartmentId equals a.Id
                            join b in _context.Buildings.Where(b => b.AdminId == adminId)
                                 on a.BuildingId equals b.Id
                            join u in _context.Users on t.Id equals u.Id
                            join c in _context.Contracts on t.Id equals c.TenantId
                            where buildingId == null || a.BuildingId == buildingId
                            orderby t.CreatedAt descending
                            select new TenantReportDto
                            {
                                Id = t.Id,
                                FullName = $"{u.FirstName} {u.LastName}",
                                BuildingName = b.BuildingName,
                                ApartmentNumber = a.UnitNumber.ToString(),
                                MoveInDate = t.CreatedAt,
                                ContractEndDate = c.EndDate,
                                MonthlyRent = c.RentAmount,
                                LastPaymentDate = _context.Payments
                                    .Where(p => p.UserId == t.Id && p.IsPaid)
                                    .OrderByDescending(p => p.PaymentDate)
                                    .Select(p => p.PaymentDate)
                                    .FirstOrDefault()
                            };

                return await query.Take(10).Distinct().ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent tenants for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<List<TenantReportDto>> GetExpiringContractsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var thirtyDaysFromNow = DateTime.Now.AddDays(30);
                _logger.LogInformation($"Checking contracts expiring before: {thirtyDaysFromNow:yyyy-MM-dd}");

                // Aktif kontratları IQueryable olarak al
                var query = _context.Contracts
                    .Where(c => c.IsActive && c.EndDate <= thirtyDaysFromNow)
                    .Join(_context.Tenants,
                        c => c.TenantId,
                        t => t.Id,
                        (c, t) => new { Contract = c, Tenant = t })
                    .Join(_context.Apartments,
                        ct => ct.Tenant.ApartmentId,
                        a => a.Id,
                        (ct, a) => new { ct.Contract, ct.Tenant, Apartment = a })
                    .Join(_context.Buildings,
                        cta => cta.Apartment.BuildingId,
                        b => b.Id,
                        (cta, b) => new { cta.Contract, cta.Tenant, cta.Apartment, Building = b })
                    .Join(_context.Users,
                        ctab => ctab.Tenant.Id,
                        u => u.Id,
                        (ctab, u) => new TenantReportDto
                        {
                            Id = ctab.Tenant.Id,
                            FullName = $"{u.FirstName} {u.LastName}",
                            BuildingName = ctab.Building.BuildingName,
                            ApartmentNumber = ctab.Apartment.UnitNumber.ToString(),
                            MoveInDate = ctab.Tenant.CreatedAt,
                            ContractEndDate = ctab.Contract.EndDate,
                            MonthlyRent = ctab.Contract.RentAmount,
                            LastPaymentDate = _context.Payments
                                .Where(p => p.UserId == ctab.Tenant.Id && p.IsPaid)
                                .OrderByDescending(p => p.PaymentDate)
                                .Select(p => p.PaymentDate)
                                .FirstOrDefault()
                        })
                    .Where(x => x.BuildingName != null &&
                               (buildingId == null || x.ApartmentNumber != null))
                    .OrderBy(x => x.ContractEndDate);

                var result = await query.ToListAsync();
                _logger.LogInformation($"Found {result.Count} expiring contracts for admin {adminId}");

                foreach (var contract in result)
                {
                    _logger.LogInformation($"Contract: Tenant={contract.FullName}, Building={contract.BuildingName}, Expires={contract.ContractEndDate:yyyy-MM-dd}");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expiring contracts for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<List<NotificationReportDto>> GetRecentNotificationsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = _context.Notifications.Where(n => n.CreatedByAdminId == adminId);

                return await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(10)
                    .Select(n => new NotificationReportDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        CreatedAt = n.CreatedAt,
                        RecipientCount = 1,
                        ReadCount = n.IsRead ? 1 : 0,
                        ReadRate = 100,
                        Type = "General"
                    })
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<List<MeetingReportDto>> GetRecentMeetingsAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = from m in _context.Meetings
                            join b in _context.Buildings.Where(b => b.AdminId == adminId)
                                 on m.BuildingId equals b.Id
                            where buildingId == null || m.BuildingId == buildingId
                            orderby m.MeetingDate descending
                            select new MeetingReportDto
                            {
                                Id = m.Id,
                                Title = m.Title,
                                MeetingDate = m.MeetingDate,
                                BuildingId = b.Id,
                                BuildingName = b.BuildingName,
                                ExpectedParticipants = 0,
                                ActualParticipants = 0,
                                ParticipationRate = 0,
                                IsCompleted = m.MeetingDate < DateTime.Now
                            };

                return await query.Take(10).Distinct().ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent meetings for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        public async Task<FinancialReportDto> GetFinancialSummaryAsync(int adminId, int? buildingId = null)
        {
            try
            {
                var query = _context.Buildings.Where(b => b.AdminId == adminId);
                if (buildingId.HasValue)
                {
                    query = query.Where(b => b.Id == buildingId.Value);
                }

                var buildings = await query.ToListAsync();
                var buildingIds = buildings.Select(b => b.Id).ToList();

                // Get all payments for the last 6 months
                var startDate = DateTime.Now.AddMonths(-6);
                var payments = await _context.Payments
                    .Where(p => buildingIds.Contains(p.BuildingId) &&
                           p.PaymentDate >= startDate)
                    .ToListAsync();

                var monthlyIncome = GetMonthlyIncome(payments);
                var buildingFinancials = await GetBuildingFinancials(buildingIds);

                var totalExpectedIncome = buildingFinancials.Sum(b => b.MonthlyExpectedIncome);
                var totalCollectedIncome = buildingFinancials.Sum(b => b.MonthlyCollectedIncome);

                return new FinancialReportDto
                {
                    TotalExpectedIncome = totalExpectedIncome,
                    TotalCollectedIncome = totalCollectedIncome,
                    CollectionRate = totalExpectedIncome > 0 ?
                        (int)Math.Round(totalCollectedIncome / totalExpectedIncome * 100) : 0,
                    TotalPayments = payments.Count(p => p.IsPaid),
                    OverduePayments = payments.Count(p => !p.IsPaid && p.DueDate < DateTime.Now),
                    MonthlyIncome = monthlyIncome,
                    BuildingFinancials = buildingFinancials
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial summary for adminId: {AdminId}, buildingId: {BuildingId}", adminId, buildingId);
                throw;
            }
        }

        private List<MonthlyIncomeReportDto> GetMonthlyIncome(List<Entities.Concrete.Payment> payments)
        {
            var result = new List<MonthlyIncomeReportDto>();
            var startDate = DateTime.Now.AddMonths(-6);

            string[] turkishMonths = { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                                      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

            for (var date = startDate; date <= DateTime.Now; date = date.AddMonths(1))
            {
                var monthStart = new DateTime(date.Year, date.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var monthlyPayments = payments.Where(p =>
                    p.PaymentDate >= monthStart &&
                    p.PaymentDate <= monthEnd).ToList();

                result.Add(new MonthlyIncomeReportDto
                {
                    Year = monthStart.Year,
                    Month = turkishMonths[monthStart.Month - 1],
                    TotalAmount = monthlyPayments.Sum(p => p.Amount),
                    PaidAmount = monthlyPayments.Where(p => p.IsPaid).Sum(p => p.Amount),
                    UnpaidAmount = monthlyPayments.Where(p => !p.IsPaid).Sum(p => p.Amount)
                });
            }

            return result;
        }

        private async Task<List<BuildingFinancialDto>> GetBuildingFinancials(List<int> buildingIds)
        {
            var result = new List<BuildingFinancialDto>();

            foreach (var buildingId in buildingIds)
            {
                var building = await _context.Buildings.FindAsync(buildingId);
                if (building == null) continue;

                var monthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var payments = await _context.Payments
                    .Where(p => p.BuildingId == buildingId &&
                           p.PaymentDate >= monthStart &&
                           p.PaymentDate <= monthEnd)
                    .ToListAsync();

                var overduePayments = await _context.Payments
                    .CountAsync(p => p.BuildingId == buildingId &&
                              !p.IsPaid && p.DueDate < DateTime.Now);

                var expectedIncome = payments.Sum(p => p.Amount);
                var collectedIncome = payments.Where(p => p.IsPaid).Sum(p => p.Amount);

                result.Add(new BuildingFinancialDto
                {
                    BuildingId = buildingId,
                    BuildingName = building.BuildingName,
                    MonthlyExpectedIncome = expectedIncome,
                    MonthlyCollectedIncome = collectedIncome,
                    CollectionRate = expectedIncome > 0 ?
                        (int)Math.Round(collectedIncome / expectedIncome * 100) : 0,
                    OverduePayments = overduePayments
                });
            }

            return result;
        }
    }
}