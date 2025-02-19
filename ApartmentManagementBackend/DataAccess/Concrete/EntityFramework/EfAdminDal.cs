using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
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

            var apartments = await _context.Apartments
                .Where(a => buildings.Contains(a.BuildingId))
                .Select(a => a.Id)
                .ToListAsync();

            return await _context.Payments
                .Where(p => apartments.Contains(p.ApartmentId))
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
                .Where(c => buildings.Contains(c.BuildingId) && !c.IsResolved)
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

        public async Task<Admin?> GetByIdAsync(int id)
        {
            return await _context.Admins.FindAsync(id);
        }

        public async Task UpdateAsync(Admin admin)
        {
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
        }
    }
}