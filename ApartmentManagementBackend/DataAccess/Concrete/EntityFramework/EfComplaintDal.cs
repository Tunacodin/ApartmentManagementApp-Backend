using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfComplaintDal : EfEntityRepositoryBase<Complaint, ApartmentManagementDbContext>, IComplaintDal
    {
        private readonly ILogger<EfComplaintDal> _logger;

        public EfComplaintDal(ApartmentManagementDbContext context, ILogger<EfComplaintDal> logger) : base(context)
        {
            _logger = logger;
        }

        public async Task<List<ComplaintDetailDto>> GetComplaintDetailsAsync(int buildingId)
        {
            try
            {
                _logger.LogInformation("Starting to get complaint details for building {BuildingId}", buildingId);

                // First, check if building exists
                var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == buildingId);
                if (!buildingExists)
                {
                    _logger.LogWarning("Building {BuildingId} not found", buildingId);
                    throw new Exception($"Building with ID {buildingId} not found");
                }

                _logger.LogDebug("Querying complaints for building {BuildingId}", buildingId);

                var complaints = await _context.Complaints
                    .Where(c => c.BuildingId == buildingId)
                    .GroupJoin(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, Users = u })
                    .SelectMany(
                        x => x.Users.DefaultIfEmpty(),
                        (c, u) => new ComplaintDetailDto
                        {
                            Id = c.Complaint.Id,
                            UserId = c.Complaint.UserId,
                            BuildingId = c.Complaint.BuildingId,
                            Subject = c.Complaint.Subject,
                            Description = c.Complaint.Description,
                            CreatedAt = c.Complaint.CreatedAt,
                            Status = c.Complaint.Status,
                            ResolvedByAdminId = c.Complaint.ResolvedByAdminId,
                            ResolvedAt = c.Complaint.ResolvedAt,
                            CreatedByName = u != null ? $"{u.FirstName} {u.LastName}" : c.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı"
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} complaints for building {BuildingId}", complaints?.Count ?? 0, buildingId);

                if (complaints == null)
                {
                    _logger.LogWarning("Query returned null for building {BuildingId}", buildingId);
                    return new List<ComplaintDetailDto>();
                }

                foreach (var complaint in complaints)
                {
                    _logger.LogDebug("Complaint {ComplaintId}: Status={Status}, UserId={UserId}, CreatedAt={CreatedAt}",
                        complaint.Id, complaint.Status, complaint.UserId, complaint.CreatedAt);
                }

                return complaints;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint details for building {BuildingId}. Error: {Message}, StackTrace: {StackTrace}",
                    buildingId, ex.Message, ex.StackTrace);
                throw;
            }
        }

        public async Task<ComplaintDetailDto> GetComplaintDetailByIdAsync(int complaintId)
        {
            try
            {
                var result = await _context.Complaints
                    .Where(c => c.Id == complaintId)
                    .GroupJoin(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, Users = u })
                    .SelectMany(
                        x => x.Users.DefaultIfEmpty(),
                        (c, u) => new ComplaintDetailDto
                        {
                            Id = c.Complaint.Id,
                            UserId = c.Complaint.UserId,
                            BuildingId = c.Complaint.BuildingId,
                            Subject = c.Complaint.Subject,
                            Description = c.Complaint.Description,
                            CreatedAt = c.Complaint.CreatedAt,
                            Status = c.Complaint.Status,
                            ResolvedByAdminId = c.Complaint.ResolvedByAdminId,
                            ResolvedAt = c.Complaint.ResolvedAt,
                            CreatedByName = u != null ? $"{u.FirstName} {u.LastName}" : c.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı"
                        })
                    .FirstOrDefaultAsync();

                return result ?? throw new Exception("Complaint not found");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting complaint detail: {ex.Message}", ex);
            }
        }

        public async Task<List<ComplaintDetailDto>> GetUserComplaintsAsync(int userId)
        {
            try
            {
                var complaints = await _context.Complaints
                    .Where(c => c.UserId == userId)
                    .GroupJoin(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, Users = u })
                    .SelectMany(
                        x => x.Users.DefaultIfEmpty(),
                        (c, u) => new ComplaintDetailDto
                        {
                            Id = c.Complaint.Id,
                            UserId = c.Complaint.UserId,
                            BuildingId = c.Complaint.BuildingId,
                            Subject = c.Complaint.Subject,
                            Description = c.Complaint.Description,
                            CreatedAt = c.Complaint.CreatedAt,
                            Status = c.Complaint.Status,
                            ResolvedByAdminId = c.Complaint.ResolvedByAdminId,
                            ResolvedAt = c.Complaint.ResolvedAt,
                            CreatedByName = u != null ? $"{u.FirstName} {u.LastName}" : c.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı"
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return complaints ?? new List<ComplaintDetailDto>();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting user complaints: {ex.Message}", ex);
            }
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
            try
            {
                return await _context.Complaints
                    .Where(c => _context.Buildings
                        .Where(b => b.AdminId == adminId)
                        .Select(b => b.Id)
                        .Contains(c.BuildingId) && c.Status != 1)
                    .GroupJoin(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, Users = u })
                    .SelectMany(
                        x => x.Users.DefaultIfEmpty(),
                        (c, u) => new ComplaintDetailDto
                        {
                            Id = c.Complaint.Id,
                            UserId = c.Complaint.UserId,
                            BuildingId = c.Complaint.BuildingId,
                            Subject = c.Complaint.Subject,
                            Description = c.Complaint.Description,
                            CreatedAt = c.Complaint.CreatedAt,
                            Status = c.Complaint.Status,
                            ResolvedByAdminId = c.Complaint.ResolvedByAdminId,
                            ResolvedAt = c.Complaint.ResolvedAt,
                            CreatedByName = u != null ? $"{u.FirstName} {u.LastName}" : c.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı"
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting active complaints: {ex.Message}", ex);
            }
        }
    }
}