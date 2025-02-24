using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
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
    }
} 