using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.Enums;
using Microsoft.Extensions.Logging;

namespace Business.Concrete
{
    public class MeetingManager : IMeetingService
    {
        private readonly IMeetingDal _meetingDal;
        private readonly ILogger<MeetingManager> _logger;

        public MeetingManager(IMeetingDal meetingDal, ILogger<MeetingManager> logger)
        {
            _meetingDal = meetingDal;
            _logger = logger;
        }

        public async Task<ApiResponse<List<MeetingDetailDto>>> GetBuildingMeetingsAsync(int buildingId)
        {
            try
            {
                var meetings = await _meetingDal.GetMeetingDetailsAsync(buildingId);
                return ApiResponse<List<MeetingDetailDto>>.SuccessResult(Messages.MeetingsListed, meetings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building meetings");
                return ApiResponse<List<MeetingDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<MeetingDetailDto>> GetMeetingDetailAsync(int meetingId)
        {
            try
            {
                var meeting = await _meetingDal.GetMeetingDetailByIdAsync(meetingId);
                return meeting == null
                    ? ApiResponse<MeetingDetailDto>.ErrorResult(Messages.MeetingNotFound)
                    : ApiResponse<MeetingDetailDto>.SuccessResult(Messages.Success, meeting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting meeting detail");
                return ApiResponse<MeetingDetailDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<MeetingDetailDto>>> GetUpcomingMeetingsAsync(int buildingId)
        {
            try
            {
                var meetings = await _meetingDal.GetUpcomingMeetingsAsync(buildingId);
                return ApiResponse<List<MeetingDetailDto>>.SuccessResult(Messages.MeetingsListed, meetings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming meetings");
                return ApiResponse<List<MeetingDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Meeting>> CreateMeetingAsync(Meeting meeting)
        {
            try
            {
                await _meetingDal.AddAsync(meeting);
                return ApiResponse<Meeting>.SuccessResult(Messages.MeetingAdded, meeting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating meeting");
                return ApiResponse<Meeting>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> CancelMeetingAsync(int meetingId, string reason)
        {
            try
            {
                var meeting = await _meetingDal.GetByIdAsync(meetingId);
                if (meeting == null)
                    return ApiResponse<bool>.ErrorResult(Messages.MeetingNotFound);

                meeting.IsCancelled = true;
                meeting.CancellationReason = reason;
                await _meetingDal.UpdateAsync(meeting);
                return ApiResponse<bool>.SuccessResult(Messages.MeetingCancelled, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling meeting");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> DeleteMeetingAsync(int meetingId)
        {
            try
            {
                var meeting = await _meetingDal.GetByIdAsync(meetingId);
                if (meeting == null)
                    return ApiResponse<bool>.ErrorResult(Messages.MeetingNotFound);

                await _meetingDal.DeleteAsync(meeting);
                return ApiResponse<bool>.SuccessResult(Messages.MeetingDeleted, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting meeting");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<int>> GetUpcomingMeetingsCountAsync(int buildingId)
        {
            try
            {
                var count = await _meetingDal.GetUpcomingMeetingsCountAsync(buildingId);
                return ApiResponse<int>.SuccessResult(Messages.Success, count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming meetings count");
                return ApiResponse<int>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public void Add(Meeting meeting)
        {
            meeting.CreatedAt = DateTime.Now;
            _meetingDal.Add(meeting);
        }

        public void Update(Meeting meeting)
        {
            _meetingDal.Update(meeting);
        }

        public void Delete(int id)
        {
            var meeting = _meetingDal.Get(m => m.Id == id);
            if (meeting != null)
                _meetingDal.Delete(meeting);
        }

        public List<Meeting> GetAll()
        {
            return _meetingDal.GetAll();
        }

        public List<Meeting> GetByBuildingId(int buildingId)
        {
            return _meetingDal.GetAll(m => m.BuildingId == buildingId);
        }

        public List<Meeting> GetUpcoming()
        {
            return _meetingDal.GetAll(m => m.MeetingDate > DateTime.Now);
        }

        public void CancelMeeting(int meetingId, string reason)
        {
            var meeting = _meetingDal.Get(m => m.Id == meetingId);
            if (meeting != null)
            {
                meeting.IsCancelled = true;
                meeting.CancellationReason = reason;
                _meetingDal.Update(meeting);
            }
        }

        public List<MeetingDto> GetUpcomingMeetingsByBuildingId(int buildingId)
        {
            try
            {
                var meetings = _meetingDal.GetAll(m => m.BuildingId == buildingId &&
                                                      m.MeetingDate > DateTime.Now &&
                                                      !m.IsCancelled);

                return meetings.Select(m => new MeetingDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    StartTime = m.MeetingDate,
                    EndTime = m.MeetingDate.AddHours(1), // Assuming 1 hour duration
                    Location = m.Location,
                    Status = m.Status switch
                    {
                        "Scheduled" => (int)MeetingStatus.Scheduled,
                        "InProgress" => (int)MeetingStatus.InProgress,
                        "Completed" => (int)MeetingStatus.Completed,
                        "Cancelled" => (int)MeetingStatus.Cancelled,
                        _ => (int)MeetingStatus.Scheduled
                    },
                    CreatedAt = m.CreatedAt,
                    BuildingId = m.BuildingId,
                    TenantId = m.OrganizedById,
                    OrganizedByName = m.OrganizedByName
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming meetings by building ID");
                return new List<MeetingDto>();
            }
        }

        public MeetingDto GetById(int id)
        {
            try
            {
                var meeting = _meetingDal.Get(m => m.Id == id);
                if (meeting == null)
                    return null;

                return new MeetingDto
                {
                    Id = meeting.Id,
                    Title = meeting.Title,
                    Description = meeting.Description,
                    StartTime = meeting.MeetingDate,
                    EndTime = meeting.MeetingDate.AddHours(1), // Assuming 1 hour duration
                    Location = meeting.Location,
                    Status = meeting.Status switch
                    {
                        "Scheduled" => (int)MeetingStatus.Scheduled,
                        "InProgress" => (int)MeetingStatus.InProgress,
                        "Completed" => (int)MeetingStatus.Completed,
                        "Cancelled" => (int)MeetingStatus.Cancelled,
                        _ => (int)MeetingStatus.Scheduled
                    },
                    CreatedAt = meeting.CreatedAt,
                    BuildingId = meeting.BuildingId,
                    TenantId = meeting.OrganizedById,
                    OrganizedByName = meeting.OrganizedByName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting meeting by ID");
                return null;
            }
        }

        public void Add(MeetingDto meetingDto)
        {
            try
            {
                var meeting = new Meeting
                {
                    Title = meetingDto.Title,
                    Description = meetingDto.Description,
                    MeetingDate = meetingDto.StartTime,
                    BuildingId = meetingDto.BuildingId,
                    OrganizedById = meetingDto.TenantId != 0 ? meetingDto.TenantId : 0,
                    CreatedAt = DateTime.Now,
                    Status = meetingDto.Status switch
                    {
                        (int)MeetingStatus.Scheduled => "Scheduled",
                        (int)MeetingStatus.InProgress => "InProgress",
                        (int)MeetingStatus.Completed => "Completed",
                        (int)MeetingStatus.Cancelled => "Cancelled",
                        _ => "Scheduled"
                    },
                    IsCancelled = false,
                    CancellationReason = string.Empty
                };

                _meetingDal.Add(meeting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding meeting from DTO");
                throw;
            }
        }

        public void Update(MeetingDto meetingDto)
        {
            try
            {
                var meeting = _meetingDal.Get(m => m.Id == meetingDto.Id);
                if (meeting == null)
                    throw new KeyNotFoundException($"Meeting with ID {meetingDto.Id} not found");

                meeting.Title = meetingDto.Title;
                meeting.Description = meetingDto.Description;
                meeting.MeetingDate = meetingDto.StartTime;
                meeting.BuildingId = meetingDto.BuildingId;
                meeting.OrganizedById = meetingDto.TenantId != 0 ? meetingDto.TenantId : 0;
                meeting.Status = meetingDto.Status switch
                {
                    (int)MeetingStatus.Scheduled => "Scheduled",
                    (int)MeetingStatus.InProgress => "InProgress",
                    (int)MeetingStatus.Completed => "Completed",
                    (int)MeetingStatus.Cancelled => "Cancelled",
                    _ => "Scheduled"
                };

                _meetingDal.Update(meeting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating meeting from DTO");
                throw;
            }
        }

        public List<MeetingDto> GetMeetingsByTenantId(int tenantId)
        {
            try
            {
                var meetings = _meetingDal.GetAll(m => m.OrganizedById == tenantId);
                return meetings.Select(m => new MeetingDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    StartTime = m.MeetingDate,
                    EndTime = m.MeetingDate.AddHours(1), // Assuming 1 hour duration
                    Location = m.Location,
                    Status = m.Status switch
                    {
                        "Scheduled" => (int)MeetingStatus.Scheduled,
                        "InProgress" => (int)MeetingStatus.InProgress,
                        "Completed" => (int)MeetingStatus.Completed,
                        "Cancelled" => (int)MeetingStatus.Cancelled,
                        _ => (int)MeetingStatus.Scheduled
                    },
                    CreatedAt = m.CreatedAt,
                    BuildingId = m.BuildingId,
                    TenantId = tenantId,
                    OrganizedByName = m.OrganizedByName
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting meetings by tenant ID");
                return new List<MeetingDto>();
            }
        }
    }
}