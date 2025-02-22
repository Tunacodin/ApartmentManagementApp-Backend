using System.Collections.Generic;
using System.Linq.Expressions;
using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;
using Entities.DTOs.Reports;

namespace DataAccess.Abstract
{
    public interface IMeetingDal : IEntityRepository<Meeting>
    {
        Task<List<MeetingDetailDto>> GetMeetingDetailsAsync(int buildingId);
        Task<MeetingDetailDto> GetMeetingDetailByIdAsync(int meetingId);
        Task<List<MeetingDetailDto>> GetUpcomingMeetingsAsync(int buildingId);
        Task<int> GetUpcomingMeetingsCountAsync(int buildingId);
        Task<MeetingStatisticsDto> GetMeetingStatisticsAsync(int adminId);
    }
}