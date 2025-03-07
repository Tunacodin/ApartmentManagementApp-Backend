using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfAdminDal : EfEntityRepositoryBase<Admin, ApartmentManagementDbContext>, IAdminDal
    {
        public EfAdminDal(ApartmentManagementDbContext context) : base(context)
        {
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
            var apartmentIds = await _context.Apartments
                .Where(a => a.BuildingId == buildingId)
                .Select(a => a.Id)
                .ToListAsync();

            return await _context.Tenants
                .Where(t => apartmentIds.Contains(t.ApartmentId))
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
            var buildings = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            return await _context.Complaints
                .Where(c => buildings.Contains(c.BuildingId) && c.Status != 1)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
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
                        UserFullName = $"{pu.User.FirstName} {pu.User.LastName}",
                        ProfileImageUrl = pu.User.ProfileImageUrl
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
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        BuildingId = c.BuildingId,
                        UserId = c.UserId,
                        Status = c.Status ?? 0,
                        CreatedByName = $"{u.FirstName} {u.LastName}",
                        ProfileImageUrl = u.ProfileImageUrl
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

        public async Task<(Building building, int complaintCount)> GetMostComplainedBuilding(int adminId)
        {
            var buildings = await GetManagedBuildings(adminId);
            var buildingIds = buildings.Select(b => b.Id).ToList();

            var complaintsPerBuilding = await _context.Complaints
                .Where(c => buildingIds.Contains(c.BuildingId))
                .GroupBy(c => c.BuildingId)
                .Select(g => new
                {
                    BuildingId = g.Key,
                    ComplaintCount = g.Count()
                })
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
    }
}