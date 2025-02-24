using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;
using Microsoft.EntityFrameworkCore;

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
                    Status = m.Status,
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
                    Status = m.Status,
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
                    Status = m.Status,
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
            var total = await _context.Meetings.CountAsync();
            var completed = await _context.Meetings.CountAsync(m => m.MeetingDate < DateTime.Now);
            
            return new MeetingStatisticsDto
            {
                TotalMeetings = total,
                CompletedMeetings = completed,
                UpcomingMeetings = total - completed,
                AttendanceRate = await _context.Meetings
                    .Where(m => m.MeetingDate < DateTime.Now)
                    .Select(m => m.AttendanceRate)
                    .DefaultIfEmpty()
                    .AverageAsync()
            };
        }
    }
}