using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IMeetingService
    {
        void Add(Meeting meeting);
        void Update(Meeting meeting);
        void Delete(int id);
        List<Meeting> GetAll();
        List<Meeting> GetByBuildingId(int buildingId);
        List<Meeting> GetUpcoming();
        void CancelMeeting(int meetingId, string reason);
        Task<ApiResponse<List<MeetingDetailDto>>> GetBuildingMeetingsAsync(int buildingId);
        Task<ApiResponse<MeetingDetailDto>> GetMeetingDetailAsync(int meetingId);
        Task<ApiResponse<List<MeetingDetailDto>>> GetUpcomingMeetingsAsync(int buildingId);
        Task<ApiResponse<Meeting>> CreateMeetingAsync(Meeting meeting);
        Task<ApiResponse<bool>> CancelMeetingAsync(int meetingId, string reason);
        Task<ApiResponse<bool>> DeleteMeetingAsync(int meetingId);
        Task<ApiResponse<int>> GetUpcomingMeetingsCountAsync(int buildingId);
        List<MeetingDto> GetUpcomingMeetingsByBuildingId(int buildingId);
        MeetingDto GetById(int id);
        void Add(MeetingDto meeting);
        void Update(MeetingDto meeting);
        List<MeetingDto> GetMeetingsByTenantId(int tenantId);
    }
}