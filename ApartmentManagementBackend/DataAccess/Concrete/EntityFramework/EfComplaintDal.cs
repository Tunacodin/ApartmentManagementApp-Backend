using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfComplaintDal : EfEntityRepositoryBase<Complaint, ApartmentManagementDbContext>, IComplaintDal
    {
        public EfComplaintDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public async Task<List<ComplaintDetailDto>> GetComplaintDetailsAsync(int buildingId)
        {
            var complaints = await _context.Complaints
                .Where(c => c.BuildingId == buildingId)
                .Join(_context.Users,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new ComplaintDetailDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        IsResolved = c.IsResolved,
                        ResolvedAt = c.ResolvedAt,
                        CreatedByName = $"{u.FirstName} {u.LastName}",
                        BuildingId = c.BuildingId
                    })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return complaints ?? new List<ComplaintDetailDto>();
        }

        public async Task<ComplaintDetailDto> GetComplaintDetailByIdAsync(int complaintId)
        {
            var result = await _context.Complaints
                .Where(c => c.Id == complaintId)
                .Join(_context.Users,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new ComplaintDetailDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        IsResolved = c.IsResolved,
                        ResolvedAt = c.ResolvedAt,
                        CreatedByName = $"{u.FirstName} {u.LastName}",
                        BuildingId = c.BuildingId
                    })
                .FirstOrDefaultAsync();

            return result ?? throw new Exception("Complaint not found");
        }

        public async Task<List<ComplaintDetailDto>> GetUserComplaintsAsync(int userId)
        {
            var complaints = await _context.Complaints
                .Where(c => c.UserId == userId)
                .Select(c => new ComplaintDetailDto
                {
                    Id = c.Id,
                    Subject = c.Subject,
                    Description = c.Description,
                    CreatedAt = c.CreatedAt,
                    IsResolved = c.IsResolved,
                    ResolvedAt = c.ResolvedAt,
                    CreatedByName = c.CreatedByName ?? string.Empty,
                    BuildingId = c.BuildingId
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return complaints ?? new List<ComplaintDetailDto>();
        }

        public async Task<int> GetActiveComplaintsCountAsync(int buildingId)
        {
            return await _context.Complaints
                .CountAsync(c => c.BuildingId == buildingId && !c.IsResolved);
        }

        public async Task<ComplaintAnalyticsDto> GetComplaintAnalyticsAsync(int adminId)
        {
            // Önce yöneticinin sorumlu olduğu binaları al
            var buildingIds = await _context.Buildings
                .Where(b => b.AdminId == adminId)
                .Select(b => b.Id)
                .ToListAsync();

            // Şikayetleri yöneticinin binalarına göre filtrele
            var complaints = _context.Complaints.Where(c => buildingIds.Contains(c.BuildingId));

            return new ComplaintAnalyticsDto
            {
                Open = await complaints.CountAsync(c => !c.IsResolved && !c.IsInProgress),
                InProgress = await complaints.CountAsync(c => !c.IsResolved && c.IsInProgress),
                Resolved = await complaints.CountAsync(c => c.IsResolved),
                AverageResolutionTime = await complaints
                    .Where(c => c.IsResolved && c.ResolvedAt.HasValue)
                    .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                    .DefaultIfEmpty(0)
                    .AverageAsync()
            };
        }
    }
} 