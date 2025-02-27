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
                        IsResolved = c.Status == 1,
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
                        IsResolved = c.Status == 1,
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
                    IsResolved = c.Status == 1,
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
                .CountAsync(c => c.BuildingId == buildingId && c.Status != 1);
        }

        public async Task<ComplaintAnalyticsDto> GetComplaintAnalyticsAsync(int adminId)
        {
            try
            {
                var buildingIds = await _context.Buildings
                    .Where(b => b.AdminId == adminId)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (!buildingIds.Any())
                {
                    return new ComplaintAnalyticsDto();
                }

                var complaints = await _context.Complaints
                    .Where(c => buildingIds.Contains(c.BuildingId))
                    .ToListAsync();

                var result = new ComplaintAnalyticsDto
                {
                    Total = complaints.Count,
                    Open = complaints.Count(c => c.Status == null),
                    InProgress = complaints.Count(c => c.Status == 0),
                    Resolved = complaints.Count(c => c.Status == 1),
                    AverageResolutionTime = complaints
                        .Where(c => c.Status == 1 && c.ResolvedAt.HasValue)
                        .Select(c => (c.ResolvedAt!.Value - c.CreatedAt).TotalHours)
                        .DefaultIfEmpty(0)
                        .Average()
                };

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting complaint analytics: {ex.Message}", ex);
            }
        }

        public async Task<List<ComplaintDetailDto>> GetActiveComplaintsAsync(int adminId)
        {
            return await _context.Complaints
                .Where(c => _context.Buildings
                    .Where(b => b.AdminId == adminId)
                    .Select(b => b.Id)
                    .Contains(c.BuildingId) && c.Status != 1)
                .Join(_context.Users,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new ComplaintDetailDto
                    {
                        Id = c.Id,
                        Subject = c.Subject,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        IsResolved = c.Status == 1,
                        ResolvedAt = c.ResolvedAt,
                        CreatedByName = $"{u.FirstName} {u.LastName}",
                        BuildingId = c.BuildingId
                    })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }
    }
}