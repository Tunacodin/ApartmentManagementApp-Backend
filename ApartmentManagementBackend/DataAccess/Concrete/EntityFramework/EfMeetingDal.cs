using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Entities.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfMeetingDal : EfEntityRepositoryBase<Meeting, ApartmentManagementDbContext>, IMeetingDal
    {
        public EfMeetingDal(ApartmentManagementDbContext context) : base(context)
        {
        }

        public async Task<List<MeetingDetailDto>> GetMeetingDetailsAsync(int buildingId)
        {
            return await _context.Meetings
                .Where(m => m.BuildingId == buildingId)
                .Select(m => new MeetingDetailDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    MeetingDate = m.MeetingDate,
                    Location = m.Location,
                    Status = m.Status == "Scheduled" ? (int)MeetingStatus.Scheduled :
                             m.Status == "InProgress" ? (int)MeetingStatus.InProgress :
                             m.Status == "Completed" ? (int)MeetingStatus.Completed :
                             m.Status == "Cancelled" ? (int)MeetingStatus.Cancelled :
                             (int)MeetingStatus.Scheduled,
                    IsCancelled = m.IsCancelled,
                    CancellationReason = m.CancellationReason,
                    OrganizedByName = m.OrganizedByName,
                    BuildingId = m.BuildingId,
                    BuildingName = _context.Buildings
                        .Where(b => b.Id == m.BuildingId)
                        .Select(b => b.BuildingName)
                        .FirstOrDefault() ?? string.Empty
                })
                .OrderByDescending(m => m.MeetingDate)
                .ToListAsync();
        }

        public async Task<MeetingDetailDto> GetMeetingDetailByIdAsync(int meetingId)
        {
            var result = await _context.Meetings
                .Where(m => m.Id == meetingId)
                .Select(m => new MeetingDetailDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    MeetingDate = m.MeetingDate,
                    Location = m.Location,
                    Status = m.Status == "Scheduled" ? (int)MeetingStatus.Scheduled :
                             m.Status == "InProgress" ? (int)MeetingStatus.InProgress :
                             m.Status == "Completed" ? (int)MeetingStatus.Completed :
                             m.Status == "Cancelled" ? (int)MeetingStatus.Cancelled :
                             (int)MeetingStatus.Scheduled,
                    IsCancelled = m.IsCancelled,
                    CancellationReason = m.CancellationReason,
                    OrganizedByName = m.OrganizedByName,
                    BuildingId = m.BuildingId,
                    BuildingName = _context.Buildings
                        .Where(b => b.Id == m.BuildingId)
                        .Select(b => b.BuildingName)
                        .FirstOrDefault() ?? string.Empty
                })
                .FirstOrDefaultAsync();

            return result ?? throw new Exception("Meeting not found");
        }

        public async Task<List<MeetingDetailDto>> GetUpcomingMeetingsAsync(int buildingId)
        {
            return await _context.Meetings
                .Where(m => m.BuildingId == buildingId &&
                           m.MeetingDate > DateTime.Now &&
                           !m.IsCancelled)
                .Select(m => new MeetingDetailDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    MeetingDate = m.MeetingDate,
                    Location = m.Location,
                    Status = m.Status == "Scheduled" ? (int)MeetingStatus.Scheduled :
                             m.Status == "InProgress" ? (int)MeetingStatus.InProgress :
                             m.Status == "Completed" ? (int)MeetingStatus.Completed :
                             m.Status == "Cancelled" ? (int)MeetingStatus.Cancelled :
                             (int)MeetingStatus.Scheduled,
                    IsCancelled = m.IsCancelled,
                    OrganizedByName = m.OrganizedByName,
                    BuildingId = m.BuildingId,
                    BuildingName = _context.Buildings
                        .Where(b => b.Id == m.BuildingId)
                        .Select(b => b.BuildingName)
                        .FirstOrDefault() ?? string.Empty
                })
                .OrderBy(m => m.MeetingDate)
                .ToListAsync();
        }

        public async Task<int> GetUpcomingMeetingsCountAsync(int buildingId)
        {
            return await _context.Meetings
                .CountAsync(m => m.BuildingId == buildingId &&
                                m.MeetingDate > DateTime.Now &&
                                !m.IsCancelled);
        }

        public async Task<MeetingStatisticsDto> GetMeetingStatisticsAsync(int adminId)
        {
            try
            {
                var buildings = await _context.Buildings
                    .Where(b => b.AdminId == adminId)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (!buildings.Any())
                {
                    return new MeetingStatisticsDto();
                }

                var meetings = await _context.Meetings
                    .Where(m => buildings.Contains(m.BuildingId))
                    .ToListAsync();

                var total = meetings.Count;
                var completed = meetings.Count(m => m.MeetingDate < DateTime.Now);

                return new MeetingStatisticsDto
                {
                    Total = total,
                    Completed = completed,
                    UpcomingMeetings = total - completed,
                    AttendanceRate = 0 // Şimdilik sabit değer, daha sonra MeetingAttendance tablosundan hesaplanabilir
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting meeting statistics: {ex.Message}", ex);
            }
        }

        public async Task<List<Meeting>> GetListAsync(Expression<Func<Meeting, bool>> filter = null)
        {
            return filter == null
                ? await _context.Meetings.ToListAsync()
                : await _context.Meetings.Where(filter).ToListAsync();
        }
    }
}