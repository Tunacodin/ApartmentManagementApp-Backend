using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;

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
                    .Join(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, User = u })
                    .GroupJoin(_context.Tenants,
                        x => x.User.Id,
                        t => t.Id,
                        (x, t) => new { x.Complaint, x.User, Tenants = t })
                    .SelectMany(
                        x => x.Tenants.DefaultIfEmpty(),
                        (x, t) => new ComplaintDetailDto
                        {
                            Id = x.Complaint.Id,
                            UserId = x.Complaint.UserId,
                            BuildingId = x.Complaint.BuildingId,
                            Subject = x.Complaint.Subject,
                            Description = x.Complaint.Description,
                            CreatedAt = x.Complaint.CreatedAt,
                            Status = x.Complaint.Status ?? 0,
                            ResolvedByAdminId = x.Complaint.ResolvedByAdminId,
                            ResolvedAt = x.Complaint.ResolvedAt,
                            CreatedByName = x.User != null ? $"{x.User.FirstName} {x.User.LastName}" : x.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı",
                            ProfileImageUrl = x.User != null ? (x.User.ProfileImageUrl ?? string.Empty) : string.Empty,
                            PhoneNumber = x.User != null ? (x.User.PhoneNumber ?? string.Empty) : string.Empty,
                            Email = x.User != null ? (x.User.Email ?? string.Empty) : string.Empty,
                            ApartmentNumber = t != null ? t.ApartmentId.ToString() : string.Empty,
                            DaysOpen = (int)(DateTime.Now - x.Complaint.CreatedAt).TotalDays,
                            StatusText = x.Complaint.Status == (int)ComplaintStatus.Resolved ? "Çözüldü" :
                                       x.Complaint.Status == (int)ComplaintStatus.InProgress ? "İşlemde" :
                                       x.Complaint.Status == (int)ComplaintStatus.Rejected ? "Reddedildi" : "Açık"
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} complaints for building {BuildingId}", complaints?.Count ?? 0, buildingId);

                return complaints ?? new List<ComplaintDetailDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaint details for building {BuildingId}", buildingId);
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
                            Status = (int)c.Complaint.Status,
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
                            Status = (int)c.Complaint.Status,
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
                .CountAsync(c => c.BuildingId == buildingId && c.Status != (int)ComplaintStatus.Resolved);
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
                    InProgress = complaints.Count(c => c.Status == (int)ComplaintStatus.InProgress),
                    Resolved = complaints.Count(c => c.Status == (int)ComplaintStatus.Resolved),
                    AverageResolutionTime = complaints
                        .Where(c => c.Status == (int)ComplaintStatus.Resolved && c.ResolvedAt.HasValue)
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
                        .Contains(c.BuildingId) && c.Status != (int)ComplaintStatus.Resolved)
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
                            Status = (int)c.Complaint.Status,
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

        public async Task<List<Complaint>> GetListAsync(Expression<Func<Complaint, bool>> filter = null)
        {
            return filter == null
                ? await _context.Complaints.ToListAsync()
                : await _context.Complaints.Where(filter).ToListAsync();
        }

        public async Task<List<Complaint>> GetUserComplaintsByBuildingIdAsync(int buildingId, int userId)
        {
            return await _context.Complaints
                .Join(_context.Tenants,
                    c => c.UserId,
                    t => t.Id,
                    (c, t) => new { Complaint = c, Tenant = t })
                .Where(x => x.Complaint.BuildingId == buildingId && x.Complaint.UserId == userId)
                .Select(x => new Complaint
                {
                    Id = x.Complaint.Id,
                    UserId = x.Complaint.UserId,
                    BuildingId = x.Complaint.BuildingId,
                    Subject = x.Complaint.Subject,
                    Description = x.Complaint.Description,
                    Status = x.Complaint.Status,
                    CreatedAt = x.Complaint.CreatedAt,
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ComplaintDetailDto>> GetPendingComplaintsAsync(int buildingId)
        {
            try
            {
                return await _context.Complaints
                    .Where(c => c.BuildingId == buildingId &&
                           (c.Status == (int)ComplaintStatus.Open || c.Status == (int)ComplaintStatus.InProgress))
                    .Join(_context.Users,
                        c => c.UserId,
                        u => u.Id,
                        (c, u) => new { Complaint = c, User = u })
                    .GroupJoin(_context.Tenants,
                        x => x.User.Id,
                        t => t.Id,
                        (x, t) => new { x.Complaint, x.User, Tenants = t })
                    .SelectMany(
                        x => x.Tenants.DefaultIfEmpty(),
                        (x, t) => new ComplaintDetailDto
                        {
                            Id = x.Complaint.Id,
                            UserId = x.Complaint.UserId,
                            BuildingId = x.Complaint.BuildingId,
                            Subject = x.Complaint.Subject,
                            Description = x.Complaint.Description,
                            CreatedAt = x.Complaint.CreatedAt,
                            Status = x.Complaint.Status ?? 0,
                            ResolvedByAdminId = x.Complaint.ResolvedByAdminId,
                            ResolvedAt = x.Complaint.ResolvedAt,
                            CreatedByName = x.User != null ? $"{x.User.FirstName} {x.User.LastName}" : x.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı",
                            ProfileImageUrl = x.User != null ? (x.User.ProfileImageUrl ?? string.Empty) : string.Empty,
                            PhoneNumber = x.User != null ? (x.User.PhoneNumber ?? string.Empty) : string.Empty,
                            Email = x.User != null ? (x.User.Email ?? string.Empty) : string.Empty,
                            ApartmentNumber = t != null ? t.ApartmentId.ToString() : string.Empty,
                            DaysOpen = (int)(DateTime.Now - x.Complaint.CreatedAt).TotalDays
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending complaints for building {BuildingId}", buildingId);
                throw;
            }
        }

        public async Task<List<ComplaintDetailDto>> GetComplaintsByAdminIdAsync(int adminId)
        {
            try
            {
                return await _context.Complaints
                    .Join(_context.Buildings,
                        c => c.BuildingId,
                        b => b.Id,
                        (c, b) => new { Complaint = c, Building = b })
                    .Where(x => x.Building.AdminId == adminId)
                    .Join(_context.Users,
                        x => x.Complaint.UserId,
                        u => u.Id,
                        (x, u) => new { x.Complaint, x.Building, User = u })
                    .GroupJoin(_context.Tenants,
                        x => x.User.Id,
                        t => t.Id,
                        (x, t) => new { x.Complaint, x.Building, x.User, Tenants = t })
                    .SelectMany(
                        x => x.Tenants.DefaultIfEmpty(),
                        (x, t) => new ComplaintDetailDto
                        {
                            Id = x.Complaint.Id,
                            UserId = x.Complaint.UserId,
                            BuildingId = x.Complaint.BuildingId,
                            Subject = x.Complaint.Subject,
                            Description = x.Complaint.Description,
                            CreatedAt = x.Complaint.CreatedAt,
                            Status = x.Complaint.Status ?? 0,
                            ResolvedByAdminId = x.Complaint.ResolvedByAdminId,
                            ResolvedAt = x.Complaint.ResolvedAt,
                            CreatedByName = x.User != null ? $"{x.User.FirstName} {x.User.LastName}" : x.Complaint.CreatedByName ?? "Bilinmeyen Kullanıcı",
                            ProfileImageUrl = x.User != null ? (x.User.ProfileImageUrl ?? string.Empty) : string.Empty,
                            PhoneNumber = x.User != null ? (x.User.PhoneNumber ?? string.Empty) : string.Empty,
                            Email = x.User != null ? (x.User.Email ?? string.Empty) : string.Empty,
                            ApartmentNumber = t != null ? t.ApartmentId.ToString() : string.Empty,
                            DaysOpen = (int)(DateTime.Now - x.Complaint.CreatedAt).TotalDays,
                            StatusText = x.Complaint.Status == (int)ComplaintStatus.Resolved ? "Çözüldü" :
                                       x.Complaint.Status == (int)ComplaintStatus.InProgress ? "İşlemde" :
                                       x.Complaint.Status == (int)ComplaintStatus.Rejected ? "Reddedildi" : "Açık"
                        })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complaints for admin {AdminId}", adminId);
                throw;
            }
        }
    }
}